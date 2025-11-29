"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSidebar } from "./SidebarContext";
import { useNotifications } from "@/contexts/NotificationContext";
import NotificationsPanel from "./NotificationsPanel";
import Image from "next/image";

const DashboardHeader = () => {
  const { data: session, status } = useSession(); // Removed 'update' to prevent infinite session refresh loop
  const { toggleSidebar } = useSidebar();
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
      className="flex justify-between items-center mobile:p-2 p-3 sm:p-6 relative z-10 bg-transparent"
      style={{ backgroundColor: "transparent" }}
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
          className="flex items-center cursor-pointer mobile:p-0.5 p-1 sm:p-2 rounded-lg transition-colors focus:outline-none"
          aria-haspopup="true"
          aria-label="Open navigation sidebar"
          data-tutorial="profile-settings"
        >
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User avatar"}
              className="mobile:w-7 mobile:h-7 w-8 h-8 sm:w-10 sm:h-10 rounded-full mobile:mr-1.5 mr-2 sm:mr-3 object-cover"
            />
          ) : (
            <div className="mobile:w-7 mobile:h-7 w-8 h-8 sm:w-10 sm:h-10 rounded-full mobile:mr-1.5 mr-2 sm:mr-3 bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center mobile:text-[10px] text-xs sm:text-sm font-semibold text-white">
              {(session?.user?.name || "U")
                .split(" ")
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase()}
            </div>
          )}
          <div className="text-left">
            <p className="font-semibold leading-tight text-white truncate mobile:max-w-[70px] max-w-[100px] sm:max-w-[140px] mobile:text-xs text-sm sm:text-base">
              {session?.user?.name || "User"}
            </p>
            <p className="mobile:text-[9px] text-xs text-gray-400 uppercase mobile:tracking-normal tracking-wide">
              {secondaryLabel}
            </p>
          </div>
          <ChevronDown
            size={14}
            className="mobile:w-3 mobile:h-3 mobile:ml-0.5 ml-1 sm:ml-2 text-gray-400 sm:w-[18px] sm:h-[18px]"
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
