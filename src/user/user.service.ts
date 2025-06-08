import {
  getAllUsers,
  type User,
  type UserWithoutPassword,
} from "./user.manager.js";

//we don't want to send the password
export function getUserList() {
  const list = getAllUsers();
  return removePassword(list);
}

export function removePassword(users: User[]): UserWithoutPassword[] {
  return users.map((user) => {
    return {
      username: user.username,
      email: user.email,
      role: user.role,
      status_phrase: user.status_phrase,
      id: user.id,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  });
}
