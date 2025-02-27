import type { Context } from "hono";
import { getUserById, type User } from "../user/user.manager.js";

import { newPrivateConversation, saveMessageInDb } from "./chat.service.js";
import {
  notifyMembersOfConvCreation,
  sendMessage,
} from "./websocket-handler.js";
import {
  getAllConversationsOfUser,
  getConversationById,
  getConversationMembers,
  isUserInConversation,
} from "./conversation.manager.js";
import { getLatestMessages } from "./message.manager.js";

/**
 * @description
 * Returns all conversations that the currently logged in user is a part of.
 * Each conversation is enhanced with the members of that conversation.
 * @param {Context} c
 * @returns
 * - 200: A list of conversations with their members
 */
export function handleConversations(c: Context) {
  const currentUser = c.get("user") as User;
  const allConversationsOfUser = getAllConversationsOfUser(currentUser.id);
  const response = allConversationsOfUser.map((conversation) => {
    const members = getConversationMembers(conversation.conversation_id);
    return { ...conversation, members };
  });
  return c.json(response, 200);
}

/**
 * @description
 * Retrieves messages for a specified conversation that the currently logged-in user is part of.
 * Validates the conversation ID and checks user's membership in the conversation.
 *
 * @param {Context} c - The context containing request and response objects.
 *
 * @returns
 * - 400: If the conversation ID is invalid.
 * - 404: If the conversation does not exist.
 * - 403: If the user is not part of the conversation.
 * - 200: A list of latest messages for the conversation.
 */
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

/**
 * @description
 * Initiates a new private conversation between the currently logged-in user and a target user.
 * Validates the target user and creates a new conversation if it doesn't already exist.
 * Notifies the members of the newly created conversation.
 *
 * @param {Context} c - The context containing request and response objects.
 *
 * @returns
 * - 404: If the target user is not found.
 * - 500: If the conversation cannot be created.
 * - 200: The newly created conversation object.
 */
export async function handleNewPrivateConversation(c: Context) {
  const { targetUserId } = await c.req.json();
  const currentUser = c.get("user") as User;

  const targetUser = getUserById(targetUserId);

  if (!targetUser) return c.json({ error: "TargetUser not found" }, 404);

  const conversation = newPrivateConversation(currentUser.id, targetUserId);

  if (!conversation) return c.json({ error: "Conversation not created" }, 500);

  notifyMembersOfConvCreation(conversation, [currentUser.id, targetUserId]); // this will notify concerned connected members that a new conv is created

  return c.json(conversation);
}

/**
 * @description
 * Creates a new message in a given conversation.
 * The user must be part of the conversation.
 * If the message is successfully saved, it is broadcast to all connected users of the conversation.
 *
 * @param {Context} c - The context containing request and response objects.
 *
 * @returns
 * - 404: If the conversation is not found.
 * - 403: If the user is not part of the conversation.
 * - 500: If the message cannot be created.
 * - 200: The newly created message object.
 */
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
