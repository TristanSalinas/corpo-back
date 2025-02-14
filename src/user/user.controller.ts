import type { Context } from "hono";
import { getAllUsers } from "./user.model.js";

export async function getUsers(c: Context) {
  return c.json(await getAllUsers());
}
