import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import authRouter from "./auth/auth.route.js";
import userRouter from "./user/user.route.js";

const app = new Hono();

app.use(cors());

app.use(logger());

app.route("/auth", authRouter);

app.route("/user", userRouter);

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
