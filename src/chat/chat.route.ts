import { Hono } from "hono";
import { checkToken } from "../auth/index.js";
import {
  handleConversations,
  handleMessages,
  handleNewPrivateConversation,
} from "./chat.controller.js";
import { webSocketHandlerFactory } from "./websocket-handler.js";
import type { NodeWebSocket } from "@hono/node-ws";

export function chatRouterFactory(
  upgradeWebSocket: NodeWebSocket["upgradeWebSocket"] //UpgradeWebSocket type
) {
  const chatRouter = new Hono();

  //get all conversations of a user
  chatRouter.get("/conversations", checkToken, handleConversations);

  //get all messages of a conversation a user is in
  chatRouter.get("/messages/:conversation_id", checkToken, handleMessages);

  chatRouter.post(
    "/new-private-conversation",
    checkToken,
    handleNewPrivateConversation
  );

  chatRouter.get("/ws", checkToken, webSocketHandlerFactory(upgradeWebSocket));

  return chatRouter;
}
