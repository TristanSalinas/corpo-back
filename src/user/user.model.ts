import db from "../config/database.js"; // Import the database connection

export type Role = "USER" | "MANAGER" | "ADMIN";
export interface User {
  id: number;
  username: string;
  password: string;
  role: Role;
  created_at: string;
}

export async function getUserByEmail(email: string) {
  const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
  return (await stmt.get(email)) as User | undefined;
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

export const getAllUsers = async () => {
  const stmt = db.prepare("SELECT * FROM users");
  return stmt.all() as User[];
};
