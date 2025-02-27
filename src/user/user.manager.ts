import db from "../config/database.js"; // Import the database connection

export type Role = "USER" | "MANAGER" | "ADMIN";
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export async function getUserByEmail(email: string) {
  const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
  return (await stmt.get(email)) as User | undefined;
}

export async function getUserById(id: number) {
  const stmt = db.prepare(`
    SELECT * FROM users WHERE id = ?
    `);
  return (await stmt.get(id)) as User | undefined;
}

export async function createUser(
  username: string,
  email: string,
  hashedPassword: string,
  role: Role
) {
  const stmt = db.prepare(`
    INSERT INTO users (username, email, password, role)
    VALUES (?, ?, ?, ?)
  `);
  return await stmt.run(username, email, hashedPassword, role);
}

export async function getAllUsers() {
  const stmt = db.prepare("SELECT * FROM users");
  return (await stmt.all()) as User[];
}

export async function deleteUser(id: number) {
  const stmt = db.prepare("DELETE FROM users WHERE id = ?");
  return await stmt.run(id);
}
