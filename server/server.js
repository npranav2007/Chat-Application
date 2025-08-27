import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/user.routes.js";
import messagesRouter from "./routes/message.routes.js";
import friendRouter from "./routes/friend.routes.js";

const PORT = process.env.PORT;
const app = express();
const server = http.createServer(app);

// Initialize socket.io server
export const io = new Server(server, {
  cors: { origin: "*" },
});

// Store online users
export const userSocketMap = {}; // { userId: socketId }

// Middleware Setup
app.use(express.json({limiy: "4mb"}));
app.use(cors())

app.use("/api/status",(req,res)=>res.send("Server is Live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/friends", friendRouter);

// Socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  
  socket.on("disconnect", () => {
    console.log("User Disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Connect to MongoDB
await connectDB();

server.listen(PORT,()=>console.log("Server is running !"))