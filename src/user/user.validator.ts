import { z } from "zod";
/*
 id: number;
  username: string;
  email: string;
  password: string;
  status_phrase: string;
  role: Role;
  */
export const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  id: z.number(),
  status_phrase: z.string(),
  role: z.enum(["USER", "MANAGER", "ADMIN"]),
});

export const partialUserWithIdSchema = userSchema
  .partial()
  .extend({ id: z.number() });

export const updateSelfSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  newPassword: z.string().min(6, "Password must be at least 6 characters long"),
  status_phrase: z.string(),
});

export const partialUpdateSelfSchema = updateSelfSchema.partial();
