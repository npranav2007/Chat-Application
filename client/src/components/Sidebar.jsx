import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Sidebar = ({ selectedUser, setSelecteduser, onUserSelect }) => {
  const navigate = useNavigate();
  const { axios, onlineUsers, socket } = useContext(AuthContext);
  const [friends, setFriends] = useState([]);
  const [unseenMap, setUnseenMap] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get friends list with unseen counts
  const getFriends = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get('/api/messages/user');
      if (data.success) {
        setFriends(data.users || []);
        setUnseenMap(data.unseenMessages || {});
      } else {
        setError('Failed to load friends');
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      setError('Failed to load friends');
      setFriends([]);
      setUnseenMap({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFriends();
  }, []);

  // Refresh unseen counts when a new message arrives
  useEffect(() => {
    if (!socket) return;
    const handler = () => getFriends();
    socket.on('newMessage', handler);
    return () => socket.off('newMessage', handler);
  }, [socket]);

  // When opening a conversation, clear its unseen count locally
  useEffect(() => {
    if (!selectedUser) return;
    if (unseenMap[selectedUser._id]) {
      setUnseenMap(prev => ({ ...prev, [selectedUser._id]: 0 }));
    }
  }, [selectedUser]);

  // Filter friends based on search query
  const filteredFriends = friends.filter(friend =>
    friend.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${
        selectedUser ? "max-md-hidden" : ""
      }`}
    >
      <div className="pb-5">
        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="search" className="w-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
            placeholder="Search Friends..."
          />
        </div>
        
        <div className="flex flex-col mt-1">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <p className="text-gray-400 text-sm mt-2">Loading friends...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">
              <p className="text-sm">{error}</p>
              <button
                onClick={getFriends}
                className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
              >
                Try again
              </button>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">
                {searchQuery ? 'No friends found' : 'No friends yet'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => navigate("/friends")}
                  className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
                >
                  Find friends to start chatting
                </button>
              )}
            </div>
          ) : (
            filteredFriends.map((friend) => {
              const rawCount = unseenMap?.[friend._id] || 0;
              const displayCount = rawCount > 5 ? '5+' : rawCount > 0 ? String(rawCount) : '';
              return (
                <div
                  onClick={() => {
                    setSelecteduser(friend);
                    onUserSelect && onUserSelect();
                  }}
                  key={friend._id}
                  className={`relative flex items-center gap-2 p-2 pl-4 rounded-md cursor-pointer max-sm:text-sm hover:bg-[#282142]/30 transition-colors ${
                    selectedUser?._id === friend._id && 'bg-[#282142]/50'
                  }`}
                >
                  <img
                    src={friend?.profilePic || assets.avatar_icon}
                    alt=""
                    className="w-[35px] aspect-[1/1] rounded-full object-cover"
                  />
                  <div className="flex flex-col leading-5">
                    <p className="truncate">{friend.fullName}</p>
                    {onlineUsers.includes(friend._id) ? (
                      <span className="text-green-400 text-xs">Online</span>
                    ) : (
                      <span className="text-neutral-400 text-xs">Offline</span>
                    )}
                  </div>
                  {displayCount && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
                      {displayCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
