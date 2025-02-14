import type { Context, Next } from "hono";
import { verifyToken } from "../utils/jwt.js";
//import { Role } from "../user/user.model.js";

//intergiciel
export async function checkToken(c: Context, next: Next) {
  const authHeader = c.req.header("Cookie");
  if (!authHeader) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  if (authHeader) {
    const token = authHeader.split("authToken=")[1].split(";")[0];
    const user = verifyToken(token);
    if (!user) {
      return c.json({ error: "Unauthorized : invalid token" }, 401);
    }
    c.set("user", user);
    await next();
  }
}
