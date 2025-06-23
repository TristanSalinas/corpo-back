import type { Context } from "hono";
import { login, register } from "./auth.service.js";
import { deleteCookie, setCookie } from "hono/cookie";
import { removePassword } from "../user/user.service.js";
import type { User } from "../user/user.manager.js";

//check si possible puis appel le bon service
export async function handleRegister(c: Context) {
  const { username, email, password } = await c.req.json();

  try {
    await register(username, email, password);
    return c.json({ message: "User registered successfully" });
  } catch (error: Error | any) {
    return c.json({ error: error?.message }, 400);
  }
}

export async function handleLogin(c: Context) {
  const { email, password } = await c.req.json();
  try {
    const log = await login(email, password);

    if (!log) {
      return c.json({ error: "Invalid email or password" }, 401);
    }
    setCookie(c, "token", log.token, {
      httpOnly: true,
    });

    return c.json({ user: log.user }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ message: "Invalid request body", error : error }, 400);
  }
}

export function handleWhoAmI(c: Context) {
  return c.json({ user: removePassword([c.get("user") as User])[0] }, 200);
}

export async function handleLogout(c: Context) {
  deleteCookie(c, "token");
  return c.json({ success: true });
}
