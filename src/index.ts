import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import authRouter from "./auth/auth.route.js";
import userRouter from "./user/user.route.js";
import { chatRouterFactory } from "./chat/chat.route.js";
import { createNodeWebSocket } from "@hono/node-ws";

const app = new Hono();
export const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({
  app,
});

app.use(logger());

//TODO app.use("csrf")

const FRONT_ORIGIN = process.env.FRONT_ORIGIN ?? "http://localhost:4200";
app.use(
  "*",
  cors({
    origin: FRONT_ORIGIN,
    credentials: true,
  })
);

app.route("/auth", authRouter);
app.route("/user", userRouter);

/*if we want to have a route /chat/ws that upgrade the connection to a websocket for this app 
  we need to apply the upgradeWebSocket created here to it's handler */
app.route("/chat", chatRouterFactory(upgradeWebSocket));

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

export const server = serve({
  fetch: app.fetch,
  port,
});

injectWebSocket(server);
