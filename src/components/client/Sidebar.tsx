"use client";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Settings,
  Shield,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const Sidebar = () => {
  const { data: session } = useSession();

  const navItems = [
    { icon: <Briefcase size={24} />, name: "Dashboard", href: "/dashboard" },
    { icon: <TrendingUp size={24} />, name: "Trade", href: "#" },
    { icon: <DollarSign size={24} />, name: "Finance", href: "#" },
    { icon: <Settings size={24} />, name: "Settings", href: "#" },
  ];

  const adminItem = {
    icon: <Shield size={24} />,
    name: "Admin",
    href: "/admin",
  };

  return (
    <motion.div
      className="bg-gray-800 text-white w-64 p-6 flex flex-col"
      initial={{ x: -256 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-2xl font-bold mb-12">m4capital</div>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-6">
              <Link
                href={item.href}
                className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
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
              >
                {adminItem.icon}
                <span className="ml-4 text-lg">{adminItem.name}</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </motion.div>
  );
};

export default Sidebar;
