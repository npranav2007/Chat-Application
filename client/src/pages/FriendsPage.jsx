import React, { useState, useEffect, useContext, useNavigate } from "react";
import { AuthContext } from "../../context/AuthContext";
import assets from "../assets/assets";
import toast from "react-hot-toast";

const FriendsPage = () => {
  const { axios } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("search"); // 'search' or 'requests'

  // Get friends list
  const getFriends = async () => {
    try {
      const { data } = await axios.get("/api/friends");
      if (data.success) {
        setFriends(data.friends);
      }
    } catch (error) {
      console.error("Error fetching friends");
    }
  };

  // Search for users (including friends)
  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(
        `/api/friends/search?query=${searchQuery}&includeFriends=true`
      );
      if (data.success) {
        // Mark which users are already friends
        const usersWithFriendStatus = data.users.map((user) => ({
          ...user,
          isFriend: friends.some((friend) => friend._id === user._id),
        }));
        setSearchResults(usersWithFriendStatus);
      }
    } catch (error) {
      toast.error("Error searching users");
    } finally {
      setLoading(false);
    }
  };

  // Send friend request
  const sendFriendRequest = async (userId) => {
    try {
      const { data } = await axios.post(`/api/friends/request/${userId}`);
      if (data.success) {
        toast.success(data.message);
        // Remove user from search results
        setSearchResults((prev) => prev.filter((user) => user._id !== userId));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error sending friend request");
    }
  };

  // Get friend requests
  const getFriendRequests = async () => {
    try {
      const { data } = await axios.get("/api/friends/requests");
      if (data.success) {
        setFriendRequests(data.requests);
      }
    } catch (error) {
      toast.error("Error fetching friend requests");
    }
  };

  // Accept friend request
  const acceptFriendRequest = async (requestId) => {
    try {
      const { data } = await axios.put(`/api/friends/accept/${requestId}`);
      if (data.success) {
        toast.success(data.message);
        setFriendRequests((prev) =>
          prev.filter((req) => req._id !== requestId)
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error accepting friend request");
    }
  };

  // Reject friend request
  const rejectFriendRequest = async (requestId) => {
    try {
      const { data } = await axios.put(`/api/friends/reject/${requestId}`);
      if (data.success) {
        toast.success(data.message);
        setFriendRequests((prev) =>
          prev.filter((req) => req._id !== requestId)
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error rejecting friend request");
    }
  };

  useEffect(() => {
    getFriends(); // Load friends on component mount
  }, []);

  useEffect(() => {
    if (activeTab === "requests") {
      getFriendRequests();
    }
  }, [activeTab]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (activeTab === "search") {
        searchUsers();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, activeTab, friends]); // Include friends in dependency array

  return (
    <div className="h-full bg-[url('./assets/bgImage.svg')] bg-contain p-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl rounded-lg shadow-md p-6 text-white border border-gray-500">
          <h1 className="text-2xl font-bold text-white mb-6">Friends</h1>

          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${
                activeTab === "requests"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Friend Requests
              {friendRequests.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {friendRequests.length}
                </span>
              )}
            </button>
            
            
          </div>

          {/* Search Tab */}
          {activeTab === "search" && (
            <div>
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search for friends by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-white/20 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-300"
                />
              </div>

              {loading && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              )}

              <div className="space-y-4">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-4 border border-gray-500 rounded-lg bg-white/5"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={user.profilePic || assets.avatar_icon}
                          alt={user.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {user.isFriend && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">
                            {user.fullName}
                          </h3>
                          {user.isFriend && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                              Friend
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300">{user.email}</p>
                        {user.bio && (
                          <p className="text-sm text-gray-400">{user.bio}</p>
                        )}
                      </div>
                    </div>
                    {user.isFriend ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-medium">Friends</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => sendFriendRequest(user._id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Add Friend
                      </button>
                    )}
                  </div>
                ))}
                {searchQuery && !loading && searchResults.length === 0 && (
                  <p className="text-center text-gray-300 py-8">
                    No users found
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Friend Requests Tab */}
          {activeTab === "requests" && (
            <div className="space-y-4">
              {friendRequests.map((request) => (
                <div
                  key={request._id}
                  className="flex items-center justify-between p-4 border border-gray-500 rounded-lg bg-white/5"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={request.from.profilePic || assets.avatar_icon}
                      alt={request.from.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-white">
                        {request.from.fullName}
                      </h3>
                      <p className="text-sm text-gray-300">
                        wants to be your friend
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => acceptFriendRequest(request._id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => rejectFriendRequest(request._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {friendRequests.length === 0 && (
                <p className="text-center text-gray-300 py-8">
                  No friend requests
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
