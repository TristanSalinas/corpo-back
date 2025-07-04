import {
  createConversationBetween,
  getPrivateConversationBetween,
} from "./conversation.manager.js";
import {
  createMessage,
  getMessageById,
  type Message,
} from "./message.manager.js";

export function newPrivateConversation(userId1: number, userId2: number) {
  const conversation = createConversationBetween([userId1, userId2]);
  if (!conversation) return null;
  return conversation;
}

export function saveMessageInDb(
  conversationId: number,
  content: string,
  senderId: number
): Message | null {
  const message_id = createMessage(conversationId, senderId, content, "text");

  if (!message_id) return null;

  return getMessageById(message_id);
}
