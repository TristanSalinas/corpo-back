import type { Context, Next } from "hono";
import type { z } from "zod";

export function validateReqBody(schema: z.ZodSchema) {
  return async (c: Context, next: Next) => {
    const body = await c.req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return c.json(
        { message: "Invalid request body", error: result.error },
        400
      );
    }
    await next();
  };
}
