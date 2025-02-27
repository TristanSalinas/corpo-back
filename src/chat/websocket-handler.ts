import type { NodeWebSocket } from "@hono/node-ws";
import type { User } from "../user/user.manager.js";
import type { WebSocket } from "ws";
import type { WSContext, WSMessageReceive } from "hono/ws";
import { getConversationMembers } from "./conversation.manager.js";
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

function handleClientSentEvent(
  evt: MessageEvent<WSMessageReceive>,
  user: User
) {
  if (typeof evt.data !== "string") return console.log(evt.data);

  const socketEvent = JSON.parse(evt.data);

  const messageParse = PostMessageSchema.safeParse(socketEvent);

  if (messageParse.success) {
    console.log(
      `server recieved the message : 
      "${messageParse.data.content}" 
      from ${user.username}#${user.id} 
      for conversation ${messageParse.data.conversationId}`
    );

    const { conversationId, content } = messageParse.data;
    const newMessage = saveMessageInDb(conversationId, content, user.id);

    if (!newMessage) {
      console.log("message could not be saved in db");
      return;
    }
    sendMessage(newMessage);
  }
  console.log(`
    ${socketEvent} from ${user.username}#${user.id} could not be parsed`);
}

//type ServerSentEvent = Message | ConvCreation | ConvDeletion;
function sendMessage(message: Message) {
  const members = getConversationMembers(message.conversation_id);
  members.forEach((member) => {
    userSockets
      .get(member.user_id)
      ?.send(JSON.stringify({ datatype: "message", payload: message }));
  });
}

export function notifyMembersOfConvCreation(conversationId: number) {
  const members = getConversationMembers(conversationId);
  const membersId = members.map((member) => member.user_id);
  members.forEach((member) => {
    userSockets.get(member.user_id)?.send(
      JSON.stringify({
        datatype: "convCreation",
        payload: { membersId: membersId },
      })
    );
  });
}
