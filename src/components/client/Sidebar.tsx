"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Settings,
  Shield,
  LogOut,
  Home,
  AlertCircle,
  Users,
  Cpu,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import ThemeLogo from "./ThemeLogo";
import { useSidebar } from "./SidebarContext";
import { useState, useEffect } from "react";
import LogoutConfirmationModal from "./LogoutConfirmationModal";
import { useTheme } from "@/contexts/ThemeContext";
import { VscVerifiedFilled } from "react-icons/vsc";

const Sidebar = () => {
  const { data: session, status } = useSession(); // Removed 'update' to prevent session refresh loops
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    // Set the base URL on the client side
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  // Fetch verification status
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (session?.user?.id) {
        try {
          const res = await fetch("/api/user/verification-status");
          if (res.ok) {
            const data = await res.json();
            setIsVerified(data.isVerified || false);
          }
        } catch (error) {
          console.error("Failed to fetch verification status:", error);
        }
      }
    };
    fetchVerificationStatus();
  }, [session?.user?.id]);

  // Session update removed to prevent infinite loops and continuous API calls
  // The session will update naturally when needed via NextAuth's built-in mechanisms

  const navItems = [
    { icon: <Home size={18} />, name: "Homepage", href: "/" },
    { icon: <Briefcase size={18} />, name: "Dashboard", href: "/dashboard" },
    { icon: <TrendingUp size={18} />, name: "Traderoom", href: "/traderoom" },
    { icon: <Users size={18} />, name: "CopyTrading", href: "/copy-trading" },
    { icon: <Cpu size={18} />, name: "F2 Pool Mining", href: "/f2pool-mining" },
    { icon: <Settings size={18} />, name: "Settings", href: "/settings" },
  ];

  // Check if user is admin for Admin panel access
  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "STAFF_ADMIN";

  const adminItem = {
    icon: <Shield size={18} />,
    name: "Admin",
    href: "/admin",
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    closeSidebar();

    try {
      // Clear localStorage and sessionStorage immediately, but preserve cookie consent
      if (typeof window !== "undefined") {
        const cookieConsent = localStorage.getItem("m4capital-cookie-consent");
        localStorage.clear();
        sessionStorage.clear();
        // Restore cookie consent preference
        if (cookieConsent) {
          localStorage.setItem("m4capital-cookie-consent", cookieConsent);
        }
      }

      // Call API route to delete cookies on server
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      // Use NextAuth's signOut to ensure all cookies are cleared
      // This handles both development and production cookie prefixes
      await signOut({
        redirect: true,
        callbackUrl: "/",
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: Use NextAuth signOut directly
      await signOut({
        redirect: true,
        callbackUrl: "/",
      });
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };
  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="sidebar-backdrop"
              className="fixed inset-0 bg-black bg-opacity-50 z-[140]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSidebar}
            />

            {/* Sidebar */}
            <motion.div
              key="sidebar-content"
              data-tutorial="sidebar"
              className={`fixed left-0 top-0 h-full w-60 sm:w-60 p-4 sm:p-4 pt-5 flex flex-col z-[145] transition-colors ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
            >
              {/* Sidebar Logo */}
              <div className="mb-6">
                <Link href="/">
                  <ThemeLogo
                    width={120}
                    height={40}
                    className="object-contain"
                    priority
                  />
                </Link>
              </div>

              {/* User Name - Mobile & Desktop */}
              {session?.user?.name && (
                <div
                  className={`mb-4 pb-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-shrink-0">
                      {session.user.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || "User"}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-orange-500 to-orange-600">
                          {(session.user.name || "U")
                            .split(" ")
                            .slice(0, 2)
                            .map((p) => p[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      {session.user.name}
                    </span>
                    {isVerified && (
                      <VscVerifiedFilled
                        className="text-green-500 flex-shrink-0"
                        size={15}
                      />
                    )}
                  </div>
                  <p
                    className={`text-xs truncate mt-1 ml-8 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {session.user.email}
                  </p>
                  {!isVerified && (
                    <Link
                      href="/settings?tab=verification"
                      onClick={closeSidebar}
                      className={`mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] font-medium transition-colors ${
                        isDark
                          ? "bg-yellow-900/20 text-yellow-300 border-yellow-700/50 hover:bg-yellow-900/30"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Verify account now</span>
                    </Link>
                  )}
                </div>
              )}
              <nav className="flex-1 overflow-y-auto">
                <ul>
                  {navItems.map((item) => (
                    <li key={item.name} className="mb-2 sm:mb-2">
                      <motion.div
                        animate={{
                          y: [0, -3, 0],
                          transition: {
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "loop",
                            ease: "easeInOut",
                            delay: Math.random() * 2, // Stagger the animations
                          },
                        }}
                      >
                        {item.name === "Traderoom" ? (
                          // Traderoom link for all users
                          <Link
                            href={item.href}
                            className={`flex items-center p-2 sm:p-2 rounded-lg transition-all duration-300 group ${isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-100"}`}
                            onClick={closeSidebar}
                            onMouseEnter={() => setHoveredItem(item.name)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            <motion.div
                              className={`group-hover:text-orange-500 transition-colors duration-300 ${isDark ? "text-gray-300" : "text-gray-600"}`}
                            >
                              {item.icon}
                            </motion.div>
                            <motion.span
                              className={`ml-3 sm:ml-3 text-sm sm:text-sm group-hover:text-orange-400 transition-colors duration-300 ${isDark ? "" : "text-gray-700"}`}
                            >
                              {item.name}
                            </motion.span>
                          </Link>
                        ) : item.name === "Settings" ? (
                          // Special Settings item with synchronized hover effects
                          <Link
                            href={item.href}
                            className={`flex items-center p-2 sm:p-2 rounded-lg transition-all duration-300 group ${isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-100"}`}
                            onClick={closeSidebar}
                            onMouseEnter={() => setHoveredItem(item.name)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            <motion.div
                              className={`group-hover:text-orange-500 transition-colors duration-300 ${isDark ? "text-gray-300" : "text-gray-600"}`}
                              animate={{
                                rotate: 0,
                                scale: 1,
                              }}
                              whileHover={{
                                rotate: 360,
                                scale: 1.1,
                                transition: {
                                  rotate: {
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 15,
                                  },
                                  scale: {
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 15,
                                  },
                                },
                              }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <motion.div
                                className="group-hover:rotate-[360deg] group-hover:scale-110 transition-transform duration-300 ease-out"
                                style={{ originX: 0.5, originY: 0.5 }}
                              >
                                {item.icon}
                              </motion.div>
                            </motion.div>
                            <motion.span
                              className={`ml-3 sm:ml-3 text-sm sm:text-sm group-hover:text-orange-500 transition-colors duration-300 ${isDark ? "text-gray-300" : "text-gray-600"}`}
                              whileHover={{
                                x: [0, 3, 0],
                                transition: {
                                  duration: 0.6,
                                  repeat: Infinity,
                                  repeatType: "loop",
                                  ease: "easeInOut",
                                },
                              }}
                            >
                              <motion.span
                                className="inline-block"
                                animate={
                                  hoveredItem === "Settings"
                                    ? {
                                        x: [0, 3, 0],
                                        transition: {
                                          duration: 0.6,
                                          repeat: Infinity,
                                          repeatType: "loop",
                                          ease: "easeInOut",
                                        },
                                      }
                                    : {
                                        x: 0,
                                      }
                                }
                                whileHover={{
                                  x: [0, 3, 0],
                                  transition: {
                                    duration: 0.6,
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    ease: "easeInOut",
                                  },
                                }}
                              >
                                {item.name}
                              </motion.span>
                            </motion.span>
                          </Link>
                        ) : (
                          // Regular navigation items
                          <Link
                            href={item.href}
                            className={`flex items-center p-2 sm:p-2 rounded-lg transition-all duration-300 group ${isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-100"}`}
                            onClick={closeSidebar}
                            onMouseEnter={() => setHoveredItem(item.name)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            <motion.div
                              className={`group-hover:text-orange-500 transition-colors duration-300 ${isDark ? "text-gray-300" : "text-gray-600"}`}
                              animate={
                                hoveredItem === item.name
                                  ? {
                                      rotate: 360,
                                      scale: 1.1,
                                      transition: {
                                        rotate: {
                                          type: "spring",
                                          stiffness: 200,
                                          damping: 15,
                                        },
                                        scale: {
                                          type: "spring",
                                          stiffness: 300,
                                          damping: 15,
                                        },
                                      },
                                    }
                                  : {
                                      rotate: 0,
                                      scale: 1,
                                    }
                              }
                              whileHover={{
                                rotate: 360,
                                scale: 1.1,
                                transition: {
                                  rotate: {
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 15,
                                  },
                                  scale: {
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 15,
                                  },
                                },
                              }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {item.icon}
                            </motion.div>
                            <motion.span
                              className={`ml-3 sm:ml-3 text-sm sm:text-sm group-hover:text-orange-500 transition-colors duration-300 ${isDark ? "text-gray-300" : "text-gray-600"}`}
                              whileHover={{
                                x: [0, 3, 0],
                                transition: {
                                  duration: 0.6,
                                  repeat: Infinity,
                                  repeatType: "loop",
                                  ease: "easeInOut",
                                },
                              }}
                            >
                              <motion.span
                                className="inline-block"
                                animate={
                                  hoveredItem === item.name
                                    ? {
                                        x: [0, 3, 0],
                                        transition: {
                                          duration: 0.6,
                                          repeat: Infinity,
                                          repeatType: "loop",
                                          ease: "easeInOut",
                                        },
                                      }
                                    : {
                                        x: 0,
                                      }
                                }
                                whileHover={{
                                  x: [0, 3, 0],
                                  transition: {
                                    duration: 0.6,
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    ease: "easeInOut",
                                  },
                                }}
                              >
                                {item.name}
                              </motion.span>
                            </motion.span>
                          </Link>
                        )}
                      </motion.div>
                    </li>
                  ))}
                  {(session?.user?.role === "ADMIN" ||
                    session?.user?.role === "STAFF_ADMIN") && (
                    <li className="mb-2">
                      <motion.div
                        animate={{
                          y: [0, -3, 0],
                          transition: {
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "loop",
                            ease: "easeInOut",
                            delay: Math.random() * 2,
                          },
                        }}
                      >
                        <Link
                          href={
                            session?.user?.role === "STAFF_ADMIN"
                              ? "/staff-admin"
                              : adminItem.href
                          }
                          className={`flex items-center p-2 sm:p-2 rounded-lg transition-all duration-300 group ${isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-100"}`}
                          onClick={closeSidebar}
                          onMouseEnter={() =>
                            setHoveredItem(
                              session?.user?.role === "STAFF_ADMIN"
                                ? "Staff Admin"
                                : "Admin",
                            )
                          }
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          <motion.div
                            className={`group-hover:text-orange-500 transition-colors duration-300 ${isDark ? "text-gray-300" : "text-gray-600"}`}
                            animate={
                              hoveredItem ===
                              (session?.user?.role === "STAFF_ADMIN"
                                ? "Staff Admin"
                                : "Admin")
                                ? {
                                    rotate: 360,
                                    scale: 1.1,
                                    transition: {
                                      rotate: {
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 15,
                                      },
                                      scale: {
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 15,
                                      },
                                    },
                                  }
                                : {
                                    rotate: 0,
                                    scale: 1,
                                  }
                            }
                            whileHover={{
                              rotate: 360,
                              scale: 1.1,
                              transition: {
                                rotate: {
                                  type: "spring",
                                  stiffness: 200,
                                  damping: 15,
                                },
                                scale: {
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 15,
                                },
                              },
                            }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {adminItem.icon}
                          </motion.div>
                          <motion.span
                            className={`ml-3 sm:ml-3 text-sm sm:text-sm group-hover:text-orange-500 transition-colors duration-300 ${isDark ? "text-gray-300" : "text-gray-600"}`}
                            whileHover={{
                              x: [0, 3, 0],
                              transition: {
                                duration: 0.6,
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "easeInOut",
                              },
                            }}
                          >
                            <motion.span
                              className="inline-block"
                              animate={
                                hoveredItem ===
                                (session?.user?.role === "STAFF_ADMIN"
                                  ? "Staff Admin"
                                  : "Admin")
                                  ? {
                                      x: [0, 3, 0],
                                      transition: {
                                        duration: 0.6,
                                        repeat: Infinity,
                                        repeatType: "loop",
                                        ease: "easeInOut",
                                      },
                                    }
                                  : {
                                      x: 0,
                                    }
                              }
                              whileHover={{
                                x: [0, 3, 0],
                                transition: {
                                  duration: 0.6,
                                  repeat: Infinity,
                                  repeatType: "loop",
                                  ease: "easeInOut",
                                },
                              }}
                            >
                              {session?.user?.role === "STAFF_ADMIN"
                                ? "Staff Admin"
                                : adminItem.name}
                            </motion.span>
                          </motion.span>
                        </Link>
                      </motion.div>
                    </li>
                  )}
                </ul>
              </nav>
              {/* Logout button at bottom */}
              <div
                className={`mt-3 sm:mt-4 pt-3 sm:pt-4 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}
              >
                <motion.div
                  animate={{
                    y: [0, -3, 0],
                    transition: {
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeInOut",
                      delay: Math.random() * 2,
                    },
                  }}
                >
                  <motion.button
                    onClick={handleLogoutClick}
                    className={`w-full flex items-center p-2 sm:p-2 rounded-lg transition-all duration-300 text-left group ${isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-100"}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onMouseEnter={() => setHoveredItem("Logout")}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <motion.div
                      className={`group-hover:text-orange-500 transition-colors duration-300 ${isDark ? "text-red-400" : "text-red-500"}`}
                      animate={
                        hoveredItem === "Logout"
                          ? {
                              rotate: 360,
                              scale: 1.1,
                              transition: {
                                rotate: {
                                  type: "spring",
                                  stiffness: 200,
                                  damping: 15,
                                },
                                scale: {
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 15,
                                },
                              },
                            }
                          : {
                              rotate: 0,
                              scale: 1,
                            }
                      }
                      whileHover={{
                        rotate: 360,
                        scale: 1.1,
                        transition: {
                          rotate: {
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                          },
                          scale: {
                            type: "spring",
                            stiffness: 300,
                            damping: 15,
                          },
                        },
                      }}
                    >
                      <LogOut size={18} />
                    </motion.div>
                    <motion.span
                      className={`ml-3 sm:ml-3 text-sm sm:text-sm group-hover:text-orange-500 transition-colors duration-300 ${isDark ? "text-red-400" : "text-red-500"}`}
                      whileHover={{
                        x: [0, 3, 0],
                        transition: {
                          duration: 0.6,
                          repeat: Infinity,
                          repeatType: "loop",
                          ease: "easeInOut",
                        },
                      }}
                    >
                      <motion.span
                        className="inline-block"
                        animate={
                          hoveredItem === "Logout"
                            ? {
                                x: [0, 3, 0],
                                transition: {
                                  duration: 0.6,
                                  repeat: Infinity,
                                  repeatType: "loop",
                                  ease: "easeInOut",
                                },
                              }
                            : {
                                x: 0,
                              }
                        }
                        whileHover={{
                          x: [0, 3, 0],
                          transition: {
                            duration: 0.6,
                            repeat: Infinity,
                            repeatType: "loop",
                            ease: "easeInOut",
                          },
                        }}
                      >
                        Log out
                      </motion.span>
                    </motion.span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

export default Sidebar;
