import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import assets from "../assets/assets";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, friendRequestCount } = useContext(AuthContext);

  const navItems = [
    { path: "/", label: "Chat" },
    { path: "/friends", label: "Friends", count: friendRequestCount },
    { path: "/profile", label: "Profile" },
  ];

  return (
    <div className="bg-black/20 backdrop-blur-md border-b border-gray-700/50 px-4 py-3 relative">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between">
        {/* Left side - Logo */}
        <div className="flex items-center gap-2">
          <img src={assets.logo_icon} alt="QuickChat" className="w-8 h-8" />
          <span className="text-white text-xl font-semibold">QuickChat</span>
        </div>

        {/* Center - Navigation Items */}
        <div className="flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-blue-500 text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
              {item.count > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.count}
                </span>
              )}
            </button>
          ))}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Layout - Full width navigation */}
      <div className="md:hidden flex w-full">
        <div className="flex w-full">
          {/* Navigation Items - Equal width */}
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex-1 flex flex-col items-center justify-center py-2 px-2 text-xs font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-blue-500 text-white rounded-lg"
                  : "text-gray-300 hover:text-white hover:bg-white/10 rounded-lg"
              }`}
            >
              <span className="text-base mb-1">{item.icon}</span>
              {item.label}
              {item.count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {item.count}
                </span>
              )}
            </button>
          ))}

          {/* Logout Button - Mobile */}
          <button
            onClick={logout}
            className="flex-1 flex flex-col items-center justify-center py-2 px-2 text-xs font-medium text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
