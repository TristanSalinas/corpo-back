import { Hono } from "hono";
import { checkToken } from "../auth/index.js";

import { handleUsers } from "./user.controller.js";

const userRouter = new Hono();

userRouter.get("/users", checkToken, handleUsers);

export default userRouter;
