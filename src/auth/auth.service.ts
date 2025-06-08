import { getUserByEmail, createUser } from "../user/user.manager.js";

import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";
import { HTTPException } from "hono/http-exception";

//Check if user exists if not add it
export async function register(
  username: string,
  email: string,
  password: string
) {
  if (await getUserByEmail(email)) {
    throw new HTTPException(409, { message: "User already exists" });
  }
  const hashedPassword = hashPassword(password);
  await createUser(username, email, hashedPassword, "USER");
}

export async function login(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user) {
    return null;
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return null;
  } else {
    return {
      token: generateToken(user),
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        status_phrase: user.status_phrase,
        id: user.id,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    };
  }
}

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}
