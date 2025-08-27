import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  getFriendRequests,
  searchUsers 
} from "../controllers/friend.controller.js";

const friendRouter = express.Router();

// Route to search users
friendRouter.get("/search", protectRoute, searchUsers);

// Route to get friend requests
friendRouter.get("/requests", protectRoute, getFriendRequests);

// Route to send friend request
friendRouter.post("/request/:userId", protectRoute, sendFriendRequest);

// Route to accept friend request
friendRouter.put("/accept/:requestId", protectRoute, acceptFriendRequest);

// Route to reject friend request
friendRouter.put("/reject/:requestId", protectRoute, rejectFriendRequest);

export default friendRouter;