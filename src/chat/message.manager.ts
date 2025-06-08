import db from "../config/database.js";

/*export interface partialMessage {
  conversation_id: number;
  sender_id: number;
  content: string;
  message_type: string;
}*/

export interface Message {
  message_id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  message_type: string;
  sent_at: string;
  updated_at: string;
}

export function getMessageById(messageId: number) {
  try {
    const stmt = db.prepare(`
      SELECT * FROM messages
      WHERE message_id = ?
    `);
    const result = stmt.get(messageId);
    return result as Message | null;
  } catch (error) {
    console.error("Error fetching message:", error);
    return null;
  }
}

export function createMessage(
  conversationId: number,
  sender_id: number,
  content: string,
  message_type: string = "text"
) {
  try {
    const stmt = db.prepare(`
      INSERT INTO messages (conversation_id, sender_id, content, message_type, sent_at, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    const result = stmt.run(conversationId, sender_id, content, message_type);
    return result.lastInsertRowid as number;
  } catch (error) {
    console.error("Error creating message:", error);
    return null;
  }
}

export function getLatestMessages(conversationId: number) {
  try {
    const stmt = db.prepare(`
      SELECT * FROM messages
      WHERE conversation_id = ?
      ORDER BY sent_at DESC
      LIMIT 50
    `);
    const result = stmt.all(conversationId);

    return result as Array<Message>;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

export function updateMessage(message_id: number, content: number) {
  try {
    const stmt = db.prepare(`
      UPDATE messages
      SET content = ?
      WHERE message_id = ?
    `);
    const result = stmt.run(content, message_id);
    return result.changes > 0;
  } catch (error) {
    console.error("Error updating message:", error);
    return false;
  }
}

export function deleteMessage(messageId: number) {
  try {
    const stmt = db.prepare("DELETE FROM messages WHERE message_id = ?");
    const result = stmt.run(messageId);
    return result.changes > 0;
  } catch (error) {
    console.error("Error deleting message:", error);
    return false;
  }
}
