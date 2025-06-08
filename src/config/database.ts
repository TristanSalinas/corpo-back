import Database from "better-sqlite3";

const db = new Database("database.db", {
  verbose: console.log,
});
function dropAllTables() {
  db.prepare("DROP TABLE IF EXISTS users").run();
  db.prepare("DROP TABLE IF EXISTS conversations").run();
  db.prepare("DROP TABLE IF EXISTS conversation_members").run();
  db.prepare("DROP TABLE IF EXISTS messages").run();
}
const initializeDatabase = () => {
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      status_phrase TEXT, 
      role TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
  ).run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS conversations (
      conversation_id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_name VARCHAR(100), 
      is_group BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
  ).run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS conversation_members (
      conversation_id INTEGER,
      user_id INTEGER,
      last_read_message_id INTEGER DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (conversation_id, user_id),
      FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `
  ).run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS messages (
      message_id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER,
      sender_id INTEGER,
      content TEXT, 
      message_type TEXT CHECK(message_type IN ('text', 'image', 'video', 'file')) DEFAULT 'text',
      sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `
  ).run();

  db.prepare(
    `
    CREATE TRIGGER IF NOT EXISTS update_users_updated_at
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
      UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;
    `
  ).run();

  db.prepare(
    `
    CREATE TRIGGER IF NOT EXISTS update_conversations_updated_at
    AFTER UPDATE ON conversations
    FOR EACH ROW
    BEGIN
      UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE conversation_id = OLD.conversation_id;
    END;
    `
  ).run();

  db.prepare(
    `
    CREATE TRIGGER IF NOT EXISTS update_conversation_members_updated_at
    AFTER UPDATE ON conversation_members
    FOR EACH ROW
    BEGIN
      UPDATE conversation_members SET updated_at = CURRENT_TIMESTAMP WHERE conversation_id = OLD.conversation_id AND user_id = OLD.user_id;
    END;
    `
  ).run();

  db.prepare(
    `
    CREATE TRIGGER IF NOT EXISTS update_messages_updated_at
    AFTER UPDATE ON messages
    FOR EACH ROW
    BEGIN
      UPDATE messages SET updated_at = CURRENT_TIMESTAMP WHERE message_id = OLD.message_id;
    END;
    `
  ).run();
};

initializeDatabase();
//dropAllTables();

export default db;
