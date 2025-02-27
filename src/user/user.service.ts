import { getAllUsers } from "./user.manager.js";

//we don't want to send the password
export async function getUserList() {
  const list = await getAllUsers();
  return list
    .filter((user) => {
      return (
        user.username && user.email && user.role && user.id && user.created_at
      );
    })
    .map((user) => {
      return {
        username: user.username,
        email: user.email,
        role: user.role,
        id: user.id,
        created_at: user.created_at,
      };
    });
}

export function doesUserExist(userId: number) {}
