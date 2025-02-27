import db from "../config/database.js";

interface ConversationMember {
  conversation_id: number;
  user_id: number;
  is_uptodate: boolean;
  created_at: string;
  updated_at: string;
}

interface Conversation {
  conversation_id: number;
  conversation_name: string;
  is_group: boolean;
  created_at: string;
  updated_at: string;
}

export function getConversationById(id: number) {
  const stmt = db.prepare(
    "SELECT * FROM conversations WHERE conversation_id = ?"
  );
  const result = stmt.get(id) as Conversation | undefined;
  if (!result) {
    return null;
  }
  return result;
}

export function getAllConversationsOfUser(userId: number) {
  const query = `
  SELECT 
    c.conversation_id, 
    c.conversation_name, 
    c.is_group, 
    c.created_at, 
    c.updated_at
  FROM 
    conversation_members cm
  JOIN 
    conversations c 
  ON 
    cm.conversation_id = c.conversation_id
  WHERE 
    cm.user_id = ?
`;

  try {
    const conversations = db.prepare(query).all(userId);
    return conversations as Array<Conversation>;
  } catch (error) {
    console.error("Error fetching group conversations:", error);
    return [];
  }
}

export function getPrivateConversationBetween(
  userId1: number,
  userId2: number
) {
  try {
    const stmt = db.prepare(`
      SELECT c.conversation_id, c.conversation_name, c.is_group, c.created_at, c.updated_at
      FROM conversations c
      JOIN conversation_members cm1 ON c.conversation_id = cm1.conversation_id
      JOIN conversation_members cm2 ON c.conversation_id = cm2.conversation_id
      WHERE c.is_group = FALSE
      AND cm1.user_id = ?
      AND cm2.user_id = ?;
      `);
    const result = stmt.get(userId1, userId2) as Conversation | undefined;
    if (!result) {
      return null;
    }
    return result;
  } catch (error) {
    console.error("Error finding conversation:", error);
    return null;
  }
}

export function createConversation(conversationName: string, isGroup: boolean) {
  try {
    const stmt = db.prepare(`
      INSERT INTO conversations (conversation_name, is_group, created_at, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    const result = stmt.run(conversationName, isGroup);
    return result.lastInsertRowid as number;
  } catch (error) {
    console.error("Error creating conversation:", error);
    return null;
  }
}

export function removeConversation(conversation_id: number) {
  try {
    const stmt = db.prepare(
      "DELETE FROM conversations WHERE conversation_id = ?;"
    );
    const result = stmt.run(conversation_id);
    return result.changes > 0;
  } catch (error) {
    console.error("Error removing conversation:", error);
    return null;
  }
}

export function addMemberToConversation(
  conversationId: number,
  userId: number
) {
  try {
    const stmt = db.prepare(`
      INSERT INTO conversation_members (conversation_id, user_id, is_uptodate, created_at, updated_at)
      VALUES (?, ?, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    const result = stmt.run(conversationId, userId);
    return result.lastInsertRowid as number;
  } catch (error) {
    console.error("Error adding user to conversation:", error);
    return null;
  }
}

export function createConversationBetween(
  userIdArray: Array<number>,
  name: string = ""
): Conversation | null {
  const isGroup = userIdArray.length > 2;
  let conversationId: number | null = null;

  try {
    db.transaction(() => {
      const createResult = db
        .prepare(
          `
        INSERT INTO conversations (conversation_name, is_group, created_at, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `
        )
        .run(name, isGroup);
      conversationId = createResult.lastInsertRowid as number;

      for (const userId of userIdArray) {
        db.prepare(
          `
          INSERT INTO conversation_members (conversation_id, user_id, is_uptodate, created_at, updated_at)
          VALUES (?, ?, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `
        ).run(conversationId, userId);
      }
    })();

    if (conversationId === null) {
      console.error("Error creating conversation between users");
      return null;
    }
    return getConversationById(conversationId);
  } catch (error) {
    console.error("Error creating conversation between users:", error);
    return null;
  }
}

export function countMembersInConversation(conversationId: number) {
  console.log("trying to count members in conversation : ", conversationId);
  try {
    const stmt = db.prepare(
      "SELECT COUNT(*) AS member_count FROM conversation_members WHERE conversation_id = ?;"
    );
    const result = stmt.get(conversationId) as { member_count: number };
    return result.member_count as number;
  } catch (error) {
    console.error("Error counting members in conversation:", error);
    return 0;
  }
}

export function isUserInConversation(conversationId: number, userId: number) {
  try {
    const stmt = db.prepare(
      "SELECT COUNT(*) AS member_count FROM conversation_members WHERE conversation_id = ? AND user_id = ?;"
    );
    const result = stmt.get(conversationId, userId) as { member_count: number };
    return result.member_count > 0;
  } catch (error) {
    console.error("Error checking if user is in conversation:", error);
    return false;
  }
}

export function getConversationMembers(conversationId: number) {
  try {
    const stmt = db.prepare(
      "SELECT * FROM conversation_members WHERE conversation_id = ?;"
    );
    const result = stmt.all(conversationId);
    return result as Array<ConversationMember>;
  } catch (error) {
    console.error("Error fetching conversation members:", error);
    return [];
  }
}

export function removeMemberFromConversation(
  conversationId: number,
  userId: number
) {
  try {
    const stmt = db.prepare(
      "DELETE FROM conversation_members WHERE conversation_id = ? AND user_id = ?;"
    );
    const result = stmt.run(conversationId, userId);
    return result.lastInsertRowid as number;
  } catch (error) {
    console.error("Error removing user from conversation:", error);
    return null;
  }
}
