"use client";
import { motion } from "framer-motion";
import { Bell, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSidebar } from "./SidebarContext";

const DashboardHeader = () => {
  const { data: session } = useSession();
  const { toggleSidebar } = useSidebar();

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
      className="flex justify-between items-center p-6 bg-gray-900 border-b border-gray-700"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <div className="flex items-center">
        <button
          className="text-gray-400 hover:text-white mr-6"
          title="Notifications"
        >
          <Bell size={24} />
        </button>
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex items-center cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          aria-haspopup="true"
          aria-label="Open navigation sidebar"
        >
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User avatar"}
              className="w-10 h-10 rounded-full mr-3 object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full mr-3 bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-sm font-semibold text-white">
              {(session?.user?.name || "U")
                .split(" ")
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase()}
            </div>
          )}
          <div className="text-left">
            <p className="font-semibold leading-tight text-white truncate max-w-[140px]">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              {secondaryLabel}
            </p>
          </div>
          <ChevronDown size={18} className="ml-2 text-gray-400" />
        </button>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
