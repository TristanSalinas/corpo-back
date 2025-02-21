import { Hono } from "hono";
import {
  handleLogin,
  handleLogout,
  handleRegister,
} from "./auth.controller.js";
import { validateReqBody } from "../common/middleware/validate.js";
import { loginSchema, registerSchema } from "./auth.validator.js";

const authRouter = new Hono();

authRouter.post("/login", validateReqBody(loginSchema), handleLogin);

authRouter.post("/register", validateReqBody(registerSchema), handleRegister);

authRouter.delete("/logout", handleLogout);

export default authRouter;
