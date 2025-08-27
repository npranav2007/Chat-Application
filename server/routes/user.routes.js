import express from "express";
import { checkAuth, login, signup, uprdateProfile } from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const userRouter = express.Router();

// Route to sign up
userRouter.post("/signup",signup);

// Route for the login
userRouter.post("/login",login);

// Route for updating profile
userRouter.put("/update-profile", protectRoute, uprdateProfile);

// Route to check the user is authenticated or not
userRouter.get("/check", protectRoute, checkAuth);

export default userRouter;