import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";

const HomePage = () => {
  const [selectedUser, setSelectedUser] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);

  return (
    <div className="w-full h-full overflow-hidden">
        <div
          className={`backdrop-blur-xl overflow-hidden h-full grid grid-cols-1 relative ${
            selectedUser
              ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
              : "md:grid-cols-2"
          } `}
        >
          {/* Mobile Sidebar Overlay */}
          {showMobileSidebar && (
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowMobileSidebar(false)}>
              <div className="w-80 h-full bg-black/90 backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
                <Sidebar
                  selectedUser={selectedUser}
                  setSelecteduser={setSelectedUser}
                  onUserSelect={() => setShowMobileSidebar(false)}
                />
              </div>
            </div>
          )}

          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <Sidebar
              selectedUser={selectedUser}
              setSelecteduser={setSelectedUser}
            />
          </div>

          <ChatContainer
            selectedUser={selectedUser}
            setSelecteduser={setSelectedUser}
            onShowSidebar={() => setShowMobileSidebar(true)}
            onShowUserDetails={() => setShowUserDetails(true)}
          />

          {/* Mobile User Details Overlay */}
          {showUserDetails && selectedUser && (
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowUserDetails(false)}>
              <div className="absolute right-0 top-0 w-80 h-full bg-black/90 backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
                <RightSidebar
                  selectedUser={selectedUser}
                  setSelecteduser={setSelectedUser}
                  onClose={() => setShowUserDetails(false)}
                />
              </div>
            </div>
          )}

          {/* Desktop Right Sidebar */}
          <div className="hidden md:block">
            <RightSidebar
              selectedUser={selectedUser}
              setSelecteduser={setSelectedUser}
            />
          </div>
        </div>
    </div>
  );
};

export default HomePage;
