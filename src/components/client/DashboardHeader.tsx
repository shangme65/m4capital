"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSidebar } from "./SidebarContext";
import { useNotifications } from "@/contexts/NotificationContext";
import NotificationsPanel from "./NotificationsPanel";
import Image from "next/image";

const DashboardHeader = () => {
  const { data: session, status } = useSession(); // Removed 'update' to prevent infinite session refresh loop
  const { toggleSidebar, isSidebarOpen } = useSidebar();
  const { unreadCount } = useNotifications();
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] =
    useState(false);

  // Session update removed - it was causing continuous /api/auth/csrf and /api/auth/session spam
  // The session will update naturally when needed via NextAuth's built-in mechanisms

  // Derive the secondary label (Investor / Trader, etc.)
  const secondaryLabel = (() => {
    const at = session?.user?.accountType;
    if (at && (at === "INVESTOR" || at === "TRADER")) {
      return at.charAt(0) + at.slice(1).toLowerCase();
    }
    // If accountType missing but role is something other than USER (e.g. ADMIN), show role
    const role = session?.user?.role;
    if (role && role !== "USER") return role;
    // Fallback default
    return "Investor";
  })();

  return (
    <motion.header
      className={`flex justify-between items-center mobile:p-2 p-3 sm:p-6 relative z-[70] transition-colors duration-300 bg-gray-900/100 backdrop-blur-sm ${
        isSidebarOpen ? "" : ""
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Image
        src="/m4capitallogo1.png"
        alt="M4 Capital Logo"
        width={120}
        height={40}
        className="object-contain mobile:w-20 w-24 md:w-auto"
        priority
      />
      <div className="flex items-center mobile:gap-2 gap-3">
        <button
          onClick={() => setIsNotificationsPanelOpen(true)}
          className="relative text-gray-400 hover:text-white transition-colors"
          title="Notifications"
          data-tutorial="notifications"
        >
          <Bell
            size={18}
            className="mobile:w-[18px] mobile:h-[18px] sm:w-6 sm:h-6"
          />
          {unreadCount > 0 && (
            <span className="absolute mobile:-top-1 -top-1 sm:-top-2 mobile:-right-1 -right-1 sm:-right-2 bg-orange-500 text-white mobile:text-[10px] text-xs mobile:w-3.5 mobile:h-3.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex items-center cursor-pointer p-1 sm:p-2 rounded-lg transition-colors focus:outline-none hover:bg-white/5"
          aria-haspopup="true"
          aria-label="Open navigation sidebar"
          data-tutorial="profile-settings"
        >
          {/* Desktop: Show avatar and name */}
          <div className="hidden sm:flex items-center">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User avatar"}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 object-cover"
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs sm:text-sm font-semibold text-white">
                {(session?.user?.name || "U")
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()}
              </div>
            )}
            <div className="text-left">
              <p className="font-semibold leading-tight text-white truncate max-w-[100px] sm:max-w-[140px] text-sm sm:text-base">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                {secondaryLabel}
              </p>
            </div>
          </div>
          {/* Hamburger icon */}
          <Menu
            size={20}
            className="mobile:w-5 mobile:h-5 sm:w-[22px] sm:h-[22px] text-gray-400 sm:ml-2"
          />
        </button>
      </div>

      <NotificationsPanel
        isOpen={isNotificationsPanelOpen}
        onClose={() => setIsNotificationsPanelOpen(false)}
      />
    </motion.header>
  );
};

export default DashboardHeader;
