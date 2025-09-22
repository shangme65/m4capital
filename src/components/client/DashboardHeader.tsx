"use client";
import { motion } from "framer-motion";
import { Bell, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";

const DashboardHeader = () => {
  const { data: session } = useSession();

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
        <div className="flex items-center">
          <img
            src={session?.user?.image || "/avatars/default.png"}
            alt="User"
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <p className="font-semibold text-white">{session?.user?.name}</p>
            <p className="text-sm text-gray-400">{session?.user?.role}</p>
          </div>
          <ChevronDown size={20} className="ml-2 text-gray-400" />
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
