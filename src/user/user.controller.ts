import type { Context } from "hono";
import { getUserList } from "./user.service.js";
import { updateUser, type User } from "./user.manager.js";
import { hashPassword } from "../auth/auth.service.js";

export async function handleUsers(c: Context) {
  return c.json(getUserList());
}

export async function handleUpdateSelf(c: Context) {
  const body = c.get("body");
  const currentUser = c.get("user") as User;

  if (body.newPassword) {
    body.newPassword = hashPassword(body.newPassword);
  }

  const runResult = updateUser(currentUser.id, body);

  if (runResult.changes > 0) {
    return c.json({ message: "User updated successfully" }, 200);
  } else {
    return c.json({ error: "User update failed" }, 500);
  }
}

export async function handleUpdateUser(c: Context) {
  return c.json({ user: c.get("user") }, 200);
}
