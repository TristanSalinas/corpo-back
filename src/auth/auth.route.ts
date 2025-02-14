import { Hono } from "hono";
import { handleLogin, handleRegister } from "./auth.controller.js";
import { validateReqBody } from "../common/middleware/validate.js";
import { loginSchema, registerSchema } from "./auth.validator.js";

const authRouter = new Hono().basePath("/auth");

authRouter.post("/login", validateReqBody(loginSchema), handleLogin);

authRouter.post("/register", validateReqBody(registerSchema), handleRegister);

export default authRouter;
