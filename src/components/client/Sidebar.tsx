"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Settings,
  Shield,
  X,
  LogOut,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSidebar } from "./SidebarContext";
import { signOut } from "next-auth/react";

const Sidebar = () => {
  const { data: session } = useSession();
  const { isSidebarOpen, closeSidebar } = useSidebar();

  const navItems = [
    { icon: <Briefcase size={24} />, name: "Dashboard", href: "/dashboard" },
    { icon: <TrendingUp size={24} />, name: "Trade", href: "#" },
    { icon: <DollarSign size={24} />, name: "Finance", href: "#" },
    { icon: <Settings size={24} />, name: "Settings", href: "/settings" },
  ];

  const adminItem = {
    icon: <Shield size={24} />,
    name: "Admin",
    href: "/admin",
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed left-0 top-0 h-full bg-gray-800 text-white w-64 p-6 flex flex-col z-50"
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close button */}
            <div className="flex justify-between items-center mb-8">
              <div className="text-2xl font-bold">m4capital</div>
              <button
                onClick={closeSidebar}
                aria-label="Close sidebar"
                className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto">
              <ul>
                {navItems.map((item) => (
                  <li key={item.name} className="mb-6">
                    <Link
                      href={item.href}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
                      onClick={closeSidebar}
                    >
                      {item.icon}
                      <span className="ml-4 text-lg">{item.name}</span>
                    </Link>
                  </li>
                ))}
                {session?.user?.role === "ADMIN" && (
                  <li className="mb-6">
                    <Link
                      href={adminItem.href}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
                      onClick={closeSidebar}
                    >
                      {adminItem.icon}
                      <span className="ml-4 text-lg">{adminItem.name}</span>
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
            {/* Logout button at bottom */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <button
                onClick={() => {
                  closeSidebar();
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors text-left text-red-400 hover:text-red-300"
              >
                <LogOut size={22} />
                <span className="ml-4 text-lg">Log out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
