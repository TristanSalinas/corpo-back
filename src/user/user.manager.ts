import db from "../config/database.js"; // Import the database connection

export type Role = "USER" | "MANAGER" | "ADMIN";
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  status_phrase: string;
  role: Role;
  created_at: string;
  updated_at: string;
}
export type UserWithoutPassword = Omit<User, "password">;

export function getUserByEmail(email: string) {
  const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
  return stmt.get(email) as User | undefined;
}

export function getUserById(id: number) {
  const stmt = db.prepare(`
    SELECT * FROM users WHERE id = ?
    `);
  return stmt.get(id) as User | undefined;
}

export function createUser(
  username: string,
  email: string,
  hashedPassword: string,
  role: Role
) {
  const stmt = db.prepare(`
    INSERT INTO users (username, email, password, role)
    VALUES (?, ?, ?, ?)
  `);
  return stmt.run(username, email, hashedPassword, role);
}

export function getAllUsers() {
  const stmt = db.prepare("SELECT * FROM users");
  return stmt.all() as User[];
}

export function updateUser(id: number, data: Partial<User>) {
  const stmt = db.prepare(`
    UPDATE users
    SET username = COALESCE(?, username),
        email = COALESCE(?, email),
        password = COALESCE(?, password),
        status_phrase = COALESCE(?, status_phrase),
        role = COALESCE(?, role),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  return stmt.run(
    data.username,
    data.email,
    data.password,
    data.status_phrase,
    data.role,
    id
  );
}

export function deleteUser(id: number) {
  const stmt = db.prepare("DELETE FROM users WHERE id = ?");
  return stmt.run(id);
}
