import type { NodeWebSocket } from "@hono/node-ws";
import type { User } from "../user/user.manager.js";
import type { WebSocket } from "ws";
import type { WSContext } from "hono/ws";
const userSockets = new Map<number, WSContext<WebSocket>();

export function webSocketHandlerFactory(
  upgradeWebSocket: NodeWebSocket["upgradeWebSocket"]
) {
  return upgradeWebSocket((c) => {
    const user: User = c.get("user");

    return {
      onOpen(event, ws) {
        if (userSockets.has(user.id)) {
          userSockets.delete(user.id);
        }
        userSockets.set(user.id, ws);
      },
      onMessage(evt, ws) {
        console.log("message : ", evt.data);
        userSockets.forEach((ws) => ws.send(user.username + " : " + evt.data));
      },
      onClose(evt, ws) {},
    };
  });
}
