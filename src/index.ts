import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import authRouter from "./auth/auth.route.js";
import userRouter from "./user/user.route.js";
import { chatRouterFactory } from "./chat/chat.route.js";
import { createNodeWebSocket } from "@hono/node-ws";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  })
);

export const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({
  app,
});

app.use(logger());

app.route("/auth", authRouter);

app.route("/user", userRouter);

app.route("/chat", chatRouterFactory(upgradeWebSocket));

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

export const server = serve({
  fetch: app.fetch,
  port,
});

injectWebSocket(server);
