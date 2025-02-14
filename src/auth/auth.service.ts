import { getUserByEmail, createUser } from "../user/user.model.js";

import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";

//Check if user exists if not add it
export async function register(
  username: string,
  email: string,
  password: string
) {
  if (await getUserByEmail(email)) {
    throw new Error("User already exists");
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  await createUser(username, username, hashedPassword, "USER");
  return await login(username, password);
}

export async function login(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user) {
    return null;
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return null;
  } else {
    return generateToken(user);
  }
}
