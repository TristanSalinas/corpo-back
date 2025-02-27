import type { Context } from "hono";
import { getUserById, type User } from "../user/user.manager.js";

import { newPrivateConversation } from "./chat.service.js";
import { notifyMembersOfConvCreation } from "./websocket-handler.js";
import {
  getAllConversationsOfUser,
  getConversationById,
  getConversationMembers,
  isUserInConversation,
} from "./conversation.manager.js";
import { getLatestMessages } from "./message.manager.js";

//get all conversations ids of a user
export function handleConversations(c: Context) {
  const currentUser = c.get("user") as User;
  const allConversationsOfUser = getAllConversationsOfUser(currentUser.id);
  const response = allConversationsOfUser.map((conversation) => {
    const members = getConversationMembers(conversation.conversation_id);
    return { ...conversation, members };
  });
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

//try to create a new private conversation between 2 users:
//first check if it exists if so return conversation id
export async function handleNewPrivateConversation(c: Context) {
  const { targetUserId } = await c.req.json();
  const currentUser = c.get("user") as User;

  const targetUser = getUserById(targetUserId);

  if (!targetUser) return c.json({ error: "TargetUser not found" }, 404);

  const conversation = newPrivateConversation(currentUser.id, targetUserId);

  if (!conversation) return c.json({ error: "Conversation not created" }, 500);

  notifyMembersOfConvCreation(conversation.conversation_id); // notify connected members

  return c.json(conversation);
}
