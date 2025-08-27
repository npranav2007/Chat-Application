import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [friendRequestCount, setFriendRequestCount] = useState(0);

  // Check if the user is authenticated and if so, set the user data and connect the socket
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
        // Get friend request count
        getFriendRequestCount();
      }
    } catch (error) {
      toast.error(error);
    }
  };

  // Get friend request count with caching
  const getFriendRequestCount = async () => {
    try {
      const { data } = await axios.get("/api/friends/requests");
      if (data.success) {
        setFriendRequestCount(data.requests?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching friend request count:', error);
      setFriendRequestCount(0);
    }
  };

  // Login function to handel user authentication and socket connection
  const login = async (state, credentials)=>{
    try {
        const { data } = await axios.post(`/api/auth/${state}`, credentials)
        if(data.success){
          setAuthUser(data.userData);
          connectSocket(data.userData);
          axios.defaults.headers.common["token"] =  data.token;
          setToken(data.token);
          localStorage.setItem("token", data.token);
          toast.success(data.message);
          return { success: true };
        }else{
          toast.error(data.message);
          return { success: false };
        }
    } catch (error) {
        toast.error(error.message);
        return { success: false };
    }
  }

// Logout function to handel logout and socket disconnection
  const logout = async ()=>{
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    setFriendRequestCount(0);
    axios.defaults.headers.common["token"] = null;
    toast.success("Logged out successfully");
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  } 

// Update profile function to handel user profile updates
  const updateProfile = async (body)=>{
    try {
      const data = await axios.put("/api/auth/update-profile", body);
      if(data.success){
        setAuthUser(data.user);
        toast.success(data.messsage);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

// Connect socket function to handle socket connection and online users updates
  const connectSocket = (userData)=>{
    if (!userData || socket?.connected) return;
    const newSocket = io(backendUrl, {
        query: {
            userId: userData._id,
        }
    })
    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds)=>{
        setOnlineUsers(userIds);
    });

    // Listen for friend request notifications
    newSocket.on("friendRequest", (data) => {
      toast.success(`${data.from.fullName} sent you a friend request!`);
      setFriendRequestCount(prev => prev + 1);
    });

    // Listen for friend request accepted notifications
    newSocket.on("friendRequestAccepted", (data) => {
      toast.success(`${data.from.fullName} accepted your friend request!`);
    });
  }

  useEffect(()=>{
    if (token) {
        axios.defaults.headers.common["token"] = token;
    }
    checkAuth();
  },[])

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    friendRequestCount,
    login,
    logout,
    updateProfile,
    getFriendRequestCount
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
