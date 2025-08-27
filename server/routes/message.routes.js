import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getMessages, getUsersForSidebar, markMessageAsSeen, sendMessage } from "../controllers/message.controller.js";

const messagesRouter = express.Router();

// Route to get users for the sidebar
messagesRouter.get("/user", protectRoute, getUsersForSidebar);

// Route to get the selected user message section
messagesRouter.get("/:id", protectRoute, getMessages);

// Route to mark the messages as seen 
messagesRouter.put("/mark/:id", protectRoute, markMessageAsSeen);

// Route to send the message
messagesRouter.post("/send/:id", protectRoute, sendMessage);

export default messagesRouter;