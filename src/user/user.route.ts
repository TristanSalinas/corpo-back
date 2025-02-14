import { Hono } from "hono";
import { checkToken } from "../auth/index.js";

import { getUsers } from "./user.controller.js";

const userRouter = new Hono().basePath("/users");

userRouter.get("/", checkToken, getUsers);

export default userRouter;
