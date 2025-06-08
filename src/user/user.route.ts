import { Hono } from "hono";
import { checkAdmin, checkToken } from "../auth/index.js";

import {
  handleUpdateSelf,
  handleUpdateUser,
  handleUsers,
} from "./user.controller.js";
import { validateReqBody } from "../common/middleware/validate.js";
import {
  partialUpdateSelfSchema,
  partialUserWithIdSchema,
} from "./user.validator.js";

const userRouter = new Hono();

userRouter.get("/users", checkToken, handleUsers);

userRouter.patch(
  "/current-user",
  checkToken,
  validateReqBody(partialUpdateSelfSchema),
  handleUpdateSelf
);
userRouter.patch(
  "/user",
  checkToken,
  checkAdmin,
  validateReqBody(partialUserWithIdSchema),
  handleUpdateUser
);

export default userRouter;
