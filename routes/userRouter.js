import express from "express";
import { getUserDetails, updateUserDetails, userLogin, userLogout, userRegister } from "../controllers/userController.js";
import userAuthenticated from "../middlewares/userAuthenticated.js"
const userRouter = express.Router();

userRouter.post("/register", userRegister);
userRouter.post("/login", userLogin);
userRouter.post("/logout", userLogout);
userRouter.get("/user-details", userAuthenticated, getUserDetails);
userRouter.patch("/user-details", userAuthenticated, updateUserDetails)

export default userRouter;