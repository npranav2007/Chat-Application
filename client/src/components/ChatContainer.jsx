import { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { AuthContext } from "../../context/AuthContext";

const ChatContainer = ({ selectedUser, setSelecteduser, onShowSidebar, onShowUserDetails }) => {
    const scrollEnd = useRef();
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");
    const { axios, authUser, socket, onlineUsers } = useContext(AuthContext);

    const isOnline = onlineUsers.includes(selectedUser?._id);

    useEffect(() => {
        if (selectedUser) {
            getMessages();
        }
    }, [selectedUser]);

    useEffect(() => {
        if (scrollEnd.current) {
            scrollEnd.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    useEffect(() => {
        if (socket) {
            socket.on("newMessage", (newMessage) => {
                if (newMessage.senderId === selectedUser?._id || newMessage.receiverId === selectedUser?._id) {
                    setMessages((prev) => [...prev, newMessage]);
                }
            });

            return () => socket.off("newMessage");
        }
    }, [socket, selectedUser]);

    const getMessages = async () => {
        try {
            const { data } = await axios.get(`/api/messages/${selectedUser._id}`);
            if (data.success) {
                // Filter out messages with invalid dates
                const validMessages = (data.messages || []).filter(msg => {
                    if (!msg.createdAt) return false;
                    const date = new Date(msg.createdAt);
                    return !isNaN(date.getTime());
                });
                setMessages(validMessages);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            setMessages([]);
        }
    };

    const sendMessage = async () => {
        if (!messageText.trim()) return;

        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, {
                text: messageText,
            });

            if (data.success) {
                setMessages((prev) => [...prev, data.newMessage]);
                setMessageText("");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    return selectedUser ? (
        <div className="h-full overflow-scroll relative backdrop-blur-lg">
            {/* Header */}
            <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
                <img 
                    src={selectedUser.avatar || assets.avatar_icon} 
                    alt="" 
                    className="w-8 rounded-full cursor-pointer md:cursor-default" 
                    onClick={() => window.innerWidth < 768 && onShowUserDetails && onShowUserDetails()}
                />
                <p className="flex-1 text-lg text-white flex items-center gap-2">
                    {selectedUser.fullName}
                    {isOnline && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                </p>
                <img onClick={() => setSelecteduser(null)} src={assets.arrow_icon} alt="" className="md:hidden max-w-7" />
                <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
            </div>
            {/* Chat Area */}
            <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
                {messages.map((msg, index) => {
                    const isMine = msg.senderId === authUser._id;
                    const bubbleBase = `p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-1 ${isMine ? 'bg-violet-500/30 text-white rounded-br-none' : 'bg-gray-500/30 text-white rounded-bl-none'}`;
                    return (
                        <div key={index} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} mb-6`}>
                            {msg.image ? (
                                <img src={msg.image} alt="" className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden' />
                            ) : (
                                <p className={bubbleBase}>
                                    {msg.text}
                                </p>
                            )}
                            <div className={`text-[10px] text-gray-400 mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
                                {formatMessageTime(msg.createdAt)}{isMine ? (msg.seen ? ' • Seen' : ' • Sent') : ''}
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollEnd}></div>
            </div>
            {/* Bottom Area */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
                <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
                    <input 
                        type="text" 
                        placeholder="Send a message" 
                        className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent" 
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <input type="file" id="image" accept="image/png , image/jpg, image/jpeg" hidden />
                    <label htmlFor="image">
                        <img src={assets.gallery_icon} alt="" className="w-5 mr-2 cursor-pointer" />
                    </label>
                </div>
                <img src={assets.send_button} alt="" className="w-7 cursor-pointer" onClick={sendMessage} />
            </div>
        </div>
    ) : (
        <div className="flex flex-col items-center justify-center gap-4 text-gray-500 bg-white/10 h-full">
            <div className="text-center">
                <img src={assets.logo_icon} alt="" className="max-w-16 mx-auto mb-4" />
                <p className="text-lg font-medium text-white mb-2">Chat anytime, Anywhere</p>
                <p className="text-sm text-gray-400 md:hidden">Select a friend to start chatting</p>
                <button 
                    onClick={onShowSidebar}
                    className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors md:hidden"
                >
                    View Friends
                </button>
            </div>
        </div>
    )
};

export default ChatContainer;
