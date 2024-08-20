import { Router } from "express";
import { getUser, login, logout, register } from "../controllers/AuthController";
import { refreshToken, verifyToken } from "../middlewares/authMiddleware";

const userRouter = Router();

userRouter.get('/user', verifyToken, getUser);
userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.post('/logout', logout);
userRouter.post('/refresh-token', refreshToken);

export default userRouter;