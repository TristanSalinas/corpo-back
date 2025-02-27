import { Hono } from "hono";
import { checkToken } from "../auth/index.js";
import {
  handleConversations,
  handleMessages,
  handleNewMessage,
  handleNewPrivateConversation,
} from "./chat.controller.js";
import { webSocketHandlerFactory } from "./websocket-handler.js";
import type { NodeWebSocket } from "@hono/node-ws";

/**
 * Creates a Hono router that handles all chat routes, the server .
 * @param {NodeWebSocket["upgradeWebSocket"]} upgradeWebSocket
 * @returns {Hono} The Hono router
 */
export function chatRouterFactory(
  upgradeWebSocket: NodeWebSocket["upgradeWebSocket"] //UpgradeWebSocket type
) {
  const chatRouter = new Hono();

  //get all conversations of the logged user
  chatRouter.get("/conversations", checkToken, handleConversations);

  //get all messages of a conversation the logged user is in
  chatRouter.get("/messages/:conversation_id", checkToken, handleMessages);

  //create a new private conversation between the logged user and another user
  //TODO validate the post body
  chatRouter.post(
    "/new-private-conversation",
    checkToken,
    handleNewPrivateConversation
  );

  //create a new message in a conversation
  //TODO validate the post body
  chatRouter.post("/new-message", checkToken, handleNewMessage);

  //upgrade the connection to a websocket
  chatRouter.get("/ws", checkToken, webSocketHandlerFactory(upgradeWebSocket));

  return chatRouter;
}
