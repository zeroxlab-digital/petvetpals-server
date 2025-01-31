import express from "express";
import { userLogin, userLogout, userRegister } from "../controllers/userController.js";
import userAuthenticated from "../middlewares/userAuthenticated.js"
const userRouter = express.Router();

userRouter.post("/register", userRegister);
userRouter.post("/login", userLogin);
userRouter.post("/logout", userLogout);

export default userRouter;