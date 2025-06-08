import type { Context } from "hono";
import { getUserById, type User } from "../user/user.manager.js";

import { newPrivateConversation, saveMessageInDb } from "./chat.service.js";
import {
  notifyMembersOfConvCreation,
  sendMessage,
} from "./websocket-handler.js";
import {
  getAllEnrichedConvOfUser,
  getConversationById,
  getPrivateConversationBetween,
  isUserInConversation,
} from "./conversation.manager.js";
import { getLatestMessages } from "./message.manager.js";
import { removePassword } from "../user/user.service.js";
import { error } from "console";

export function handleConversations(c: Context) {
  const currentUser = c.get("user") as User;

  const response = getAllEnrichedConvOfUser(currentUser.id);
  return c.json(response, 200);
}

export function handleMessages(c: Context) {
  const currentUser = c.get("user") as User;

  const { conversation_id: stringConversationId } = c.req.param();

  const conversationId = parseInt(stringConversationId);
  if (isNaN(conversationId)) {
    return c.json({ error: "Invalid conversation ID" }, 400);
  }

  if (getConversationById(conversationId) === null)
    return c.json({ error: "Conversation not found" }, 404);

  if (!isUserInConversation(conversationId, currentUser.id)) {
    return c.json({ error: "User is not part of the conversation" }, 403);
  }
  return c.json(getLatestMessages(conversationId), 200);
}

export async function handleNewPrivateConversation(c: Context) {
  const { targetUserId } = await c.req.json();

  const currentUser = c.get("user") as User;

  if (targetUserId === currentUser.id)
    return c.json(
      { error: "You cannot create a conversation with yourself" },
      403
    );
  const targetUser = getUserById(targetUserId);

  if (!targetUser) return c.json({ error: "TargetUser not found" }, 404);

  let conversation = getPrivateConversationBetween(
    currentUser.id,
    targetUserId
  );
  if (conversation) {
    return c.json({ error: "Conversation already exist" }, 409);
  }

  conversation = newPrivateConversation(currentUser.id, targetUserId);

  if (!conversation) return c.json({ error: "Conversation not created" }, 500);

  notifyMembersOfConvCreation(
    conversation,
    removePassword([currentUser, targetUser])
  ); // this will notify concerned connected members that a new conv is created

  return c.json(
    { ...conversation, users: removePassword([currentUser, targetUser]) },
    200
  );
}

export async function handleNewMessage(c: Context) {
  const { conversationId, content } = await c.req.json();
  const currentUser = c.get("user") as User;

  if (getConversationById(conversationId) === null)
    return c.json({ error: "Conversation not found" }, 404);

  if (!isUserInConversation(conversationId, currentUser.id)) {
    return c.json({ error: "User is not part of the conversation" }, 403);
  }

  const message = saveMessageInDb(conversationId, content, currentUser.id);

  if (!message) return c.json({ error: "Message could not be created" }, 500);

  sendMessage(message); //this will send the message to the concerned connected members

  return c.json(message, 200);
}
