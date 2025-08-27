import User from "../models/user.models.js";
import { io, userSocketMap } from "../server.js";

// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const senderId = req.user._id;

    if (senderId.toString() === userId) {
      return res.json({
        success: false,
        message: "You cannot send friend request to yourself"
      });
    }

    const receiver = await User.findById(userId);
    if (!receiver) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    // Check if already friends
    if (receiver.friends.includes(senderId)) {
      return res.json({
        success: false,
        message: "You are already friends"
      });
    }

    // Check if request already sent
    const existingRequest = receiver.friendRequests.find(
      req => req.from.toString() === senderId.toString() && req.status === "pending"
    );

    if (existingRequest) {
      return res.json({
        success: false,
        message: "Friend request already sent"
      });
    }

    // Add to receiver's friend requests
    receiver.friendRequests.push({
      from: senderId,
      status: "pending"
    });

    // Add to sender's sent requests
    const sender = await User.findById(senderId);
    sender.sentRequests.push({
      to: userId,
      status: "pending"
    });

    await receiver.save();
    await sender.save();

    // Emit notification to receiver if online
    const receiverSocketId = userSocketMap[userId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friendRequest", {
        from: {
          _id: sender._id,
          fullName: sender.fullName,
          profilePic: sender.profilePic
        }
      });
    }

    res.json({
      success: true,
      message: "Friend request sent successfully"
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const requestIndex = user.friendRequests.findIndex(
      req => req._id.toString() === requestId && req.status === "pending"
    );

    if (requestIndex === -1) {
      return res.json({
        success: false,
        message: "Friend request not found"
      });
    }

    const request = user.friendRequests[requestIndex];
    const senderId = request.from;

    // Update request status
    user.friendRequests[requestIndex].status = "accepted";

    // Add to friends list
    user.friends.push(senderId);

    // Update sender's sent request and add to friends
    const sender = await User.findById(senderId);
    const senderRequestIndex = sender.sentRequests.findIndex(
      req => req.to.toString() === userId.toString() && req.status === "pending"
    );

    if (senderRequestIndex !== -1) {
      sender.sentRequests[senderRequestIndex].status = "accepted";
    }
    sender.friends.push(userId);

    await user.save();
    await sender.save();

    // Emit notification to sender if online
    const senderSocketId = userSocketMap[senderId];
    if (senderSocketId) {
      io.to(senderSocketId).emit("friendRequestAccepted", {
        from: {
          _id: user._id,
          fullName: user.fullName,
          profilePic: user.profilePic
        }
      });
    }

    res.json({
      success: true,
      message: "Friend request accepted"
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const requestIndex = user.friendRequests.findIndex(
      req => req._id.toString() === requestId && req.status === "pending"
    );

    if (requestIndex === -1) {
      return res.json({
        success: false,
        message: "Friend request not found"
      });
    }

    const request = user.friendRequests[requestIndex];
    const senderId = request.from;

    // Update request status
    user.friendRequests[requestIndex].status = "rejected";

    // Update sender's sent request
    const sender = await User.findById(senderId);
    const senderRequestIndex = sender.sentRequests.findIndex(
      req => req.to.toString() === userId.toString() && req.status === "pending"
    );

    if (senderRequestIndex !== -1) {
      sender.sentRequests[senderRequestIndex].status = "rejected";
    }

    await user.save();
    await sender.save();

    res.json({
      success: true,
      message: "Friend request rejected"
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Get friend requests
export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .populate('friendRequests.from', 'fullName profilePic bio')
      .select('friendRequests');

    const pendingRequests = user.friendRequests.filter(req => req.status === "pending");

    res.json({
      success: true,
      requests: pendingRequests
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Search users (excluding friends and pending requests)
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user._id;

    if (!query) {
      return res.json({
        success: false,
        message: "Search query is required"
      });
    }

    const currentUser = await User.findById(userId);
    const friendIds = currentUser.friends;
    const pendingRequestIds = currentUser.sentRequests
      .filter(req => req.status === "pending")
      .map(req => req.to);

    const users = await User.find({
      $and: [
        { _id: { $ne: userId } },
        { _id: { $nin: friendIds } },
        { _id: { $nin: pendingRequestIds } },
        {
          $or: [
            { fullName: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).select('fullName email profilePic bio').limit(10);

    res.json({
      success: true,
      users
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};