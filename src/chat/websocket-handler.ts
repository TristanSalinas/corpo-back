import type { NodeWebSocket } from "@hono/node-ws";
import type { User, UserWithoutPassword } from "../user/user.manager.js";
import type { WebSocket } from "ws";
import type { WSContext, WSMessageReceive } from "hono/ws";
import {
  getConversationMembers,
  type Conversation,
} from "./conversation.manager.js";
import type { Message } from "./message.manager.js";
import { z } from "zod";
import { saveMessageInDb } from "./chat.service.js";

const userSockets = new Map<number, WSContext<WebSocket>>();

export function webSocketHandlerFactory(
  upgradeWebSocket: NodeWebSocket["upgradeWebSocket"]
) {
  return upgradeWebSocket((c) => {
    const user: User = c.get("user");

    return {
      onOpen(event, ws) {
        if (userSockets.has(user.id)) {
          userSockets.delete(user.id);
        }
        userSockets.set(user.id, ws);
      },
      onMessage(evt, ws) {
        handleClientSentEvent(evt, user);
      },
      onClose(evt, ws) {},
    };
  });
}

const PostMessageSchema = z.object({
  conversationId: z.number(),
  content: z.string(),
});

const userEventSchema = z.object({
  datatype: z.enum(["message"]),
  payload: PostMessageSchema,
});

function handleClientSentEvent(
  evt: MessageEvent<WSMessageReceive>,
  user: User
) {
  if (typeof evt.data !== "string") return console.log(evt.data);

  const socketEvent = JSON.parse(evt.data);
  console.log("trying to parse :", evt.data);
  const messageParse = userEventSchema.safeParse(socketEvent);

  if (messageParse.success) {
    console.log(
      `server recieved the message : 
      "${messageParse.data.payload.content}" 
      from ${user.username}#${user.id} 
      for conversation ${messageParse.data.payload.conversationId}`
    );

    const { conversationId, content } = messageParse.data.payload;
    const newMessage = saveMessageInDb(conversationId, content, user.id);

    if (!newMessage) {
      console.log("message could not be saved in db");
      return;
    }
    sendMessage(newMessage);
  } else {
    console.log(`
      ${socketEvent} from ${user.username}#${user.id} could not be parsed`);
  }
}

export function sendMessage(message: Message) {
  const members = getConversationMembers(message.conversation_id);
  members.forEach((member) => {
    userSockets
      .get(member.user_id)
      ?.send(JSON.stringify({ datatype: "message", payload: message }));
  });
}

export function notifyMembersOfConvCreation(
  conversation: Conversation,
  membersArray: UserWithoutPassword[]
) {
  membersArray.forEach((user) => {
    userSockets.get(user.id)?.send(
      JSON.stringify({
        datatype: "convCreation",
        payload: { ...conversation, users: membersArray },
      })
    );
  });
}
