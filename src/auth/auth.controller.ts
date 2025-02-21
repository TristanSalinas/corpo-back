import type { Context } from "hono";
import { login, register } from "./auth.service.js";
import { deleteCookie, setCookie } from "hono/cookie";

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
    const token = await login(email, password);

    if (!token) {
      return c.json({ error: "Invalid email or password" }, 401);
    }
    setCookie(c, "token", token, {
      httpOnly: true,
    });

    return c.json({ success: true });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Invalid request body" }, 400);
  }
}

export async function handleLogout(c: Context) {
  deleteCookie(c, "token");
  return c.json({ success: true });
}
