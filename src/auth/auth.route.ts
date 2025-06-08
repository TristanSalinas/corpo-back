import { Hono } from "hono";
import {
  handleLogin,
  handleLogout,
  handleRegister,
  handleWhoAmI,
} from "./auth.controller.js";
import { validateReqBody } from "../common/middleware/validate.js";
import { loginSchema, registerSchema } from "./auth.validator.js";
import { checkToken } from "./index.js";

const authRouter = new Hono();

authRouter.post("/login", validateReqBody(loginSchema), handleLogin);
authRouter.get("/me", checkToken, handleWhoAmI);

authRouter.post("/register", validateReqBody(registerSchema), handleRegister);

authRouter.delete("/logout", handleLogout);

export default authRouter;
