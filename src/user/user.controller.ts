import type { Context } from "hono";
import { getUserList } from "./user.service.js";

export async function handleUsers(c: Context) {
  return c.json(await getUserList());
}
