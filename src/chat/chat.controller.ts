import type { Context } from "hono";

//try to get conversation list for a user
//TODO: add uptodate status relative to user
export function handleConversations(c: Context) {
  return c.json({});
}

//try to get messages of a conversation
export function handleMessages(c: Context) {
  return c.json({});
}
