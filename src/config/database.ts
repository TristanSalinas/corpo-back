import Database from "better-sqlite3";

const db = new Database("database.db", {
  verbose: console.log,
});

const initializeDatabase = () => {
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
  ).run();
};

initializeDatabase();

export default db;
