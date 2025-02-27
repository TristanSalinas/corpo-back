import {
  createConversationBetween,
  getPrivateConversationBetween,
} from "./conversation.manager.js";
import {
  createMessage,
  getMessageById,
  type Message,
} from "./message.manager.js";

/**
 * Create a new private conversation between 2 users.
 * If the conversation already exists, return it.
 * Otherwise we create a new conversation and return it.
 * @param userId1 The first user's id
 * @param userId2 The second user's id
 * @returns The conversation if it exists, otherwise null
 */
export function newPrivateConversation(userId1: number, userId2: number) {
  let conversation = getPrivateConversationBetween(userId1, userId2);
  if (conversation) {
    //conversation already exists
    return conversation;
  } else {
    conversation = createConversationBetween([userId1, userId2]);
    if (!conversation) return null;
    return conversation;
  }
}

/**
 * Save a new message in the database.
 * @param conversationId The id of the conversation in which the message is to be saved.
 * @param content The content of the message.
 * @param senderId The id of the user who sent the message.
 * @returns The saved message if the message was successfully saved, otherwise null.
 */
export function saveMessageInDb(
  conversationId: number,
  content: string,
  senderId: number
): Message | null {
  const message_id = createMessage(conversationId, senderId, content, "text");

  if (!message_id) return null;

  return getMessageById(message_id);
}
