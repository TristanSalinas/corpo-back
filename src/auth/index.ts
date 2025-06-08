import type { Context, Next } from "hono";
import { verifyToken } from "../utils/jwt.js";
import { getCookie } from "hono/cookie";
import type { User } from "../user/user.manager.js";

export async function checkToken(c: Context, next: Next) {
  const authCookie = getCookie(c, "token");

  if (!authCookie) {
    return c.json({ error: "Forbidden : no token" }, 403);
  }
  if (authCookie) {
    const token = authCookie;
    const user = verifyToken(token);
    if (!user) {
      return c.json({ error: "Unauthorized : invalid token" }, 401);
    }
    c.set("user", user);
    await next();
  }
}

export async function checkAdmin(c: Context, next: Next) {
  const user = c.get("user") as User;

  if (!user || !user.role) {
    return c.json({ error: "Forbidden: User not authenticated" }, 403);
  }
  if (user.role !== "ADMIN") {
    return c.json({ error: "Forbidden : not admin" }, 403);
  }
  await next();
}
