import type { NodeWebSocket } from "@hono/node-ws";
import type { User } from "../user/user.manager.js";
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

/**
 * Factory function to create a WebSocket handler using the provided upgradeWebSocket function.
 *
 * @param upgradeWebSocket - Function to upgrade an HTTP connection to a WebSocket connection.
 * @returns A function that handles WebSocket events for a given user context.
 *
 * The returned handler manages the following WebSocket events:
 * - `onOpen`: Registers the WebSocket connection for the user. If a previous connection exists, it is replaced.
 * - `onMessage`: Handles incoming messages using the `handleClientSentEvent` function.
 * - `onClose`: Placeholder for handling WebSocket closure events.
 */

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

/**
 * Handles incoming WebSocket messages from a client. SortOf the "router" of the websocket.
 *
 * @param evt - The received WebSocket event. If the event is not a string, it is logged and ignored.
 * @param user - The user who sent the message.
 *
 * The message is parsed using the `PostMessageSchema` Zod schema. If the parse is successful, the message
 * is saved to the database then sent to all connected users. If the parse fails, the original message is logged.
 *
 * If the message is successfully saved to the database, it is broadcast to all users using the
 * `sendMessage` function.
 */
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

/* interface ServerSentEvent {
  datatype = "message" | "convCreation" | "convDeletion";
  payload: Message | { conversation: Conversation; membersIds: number[] };
}

/**
 * Sends a message to all members of a conversation.
 * @param message - The message to be sent.
 */
function sendMessage(message: Message) {
  const members = getConversationMembers(message.conversation_id);
  members.forEach((member) => {
    userSockets
      .get(member.user_id)
      ?.send(JSON.stringify({ datatype: "message", payload: message }));
  });
}

/**
 * Notifies all members of a conversation that the conversation has been created.
 * @param conversation - The newly created conversation.
 * @param membersIds - An array of user IDs of the members to be notified.
 */

export function notifyMembersOfConvCreation(
  conversation: Conversation,
  membersIds: number[]
) {
  membersIds.forEach((memberId) => {
    userSockets.get(memberId)?.send(
      JSON.stringify({
        datatype: "convCreation",
        payload: { conversation, membersIds: membersIds },
      })
    );
  });
}
