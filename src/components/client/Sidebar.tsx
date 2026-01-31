"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Settings,
  Shield,
  LogOut,
  Newspaper,
  Home,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useSidebar } from "./SidebarContext";
import { useState, useEffect } from "react";
import LogoutConfirmationModal from "./LogoutConfirmationModal";

const Sidebar = () => {
  const { data: session, status } = useSession(); // Removed 'update' to prevent session refresh loops
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    // Set the base URL on the client side
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  // Session update removed to prevent infinite loops and continuous API calls
  // The session will update naturally when needed via NextAuth's built-in mechanisms

  const navItems = [
    { icon: <Home size={24} />, name: "Homepage", href: "/" },
    { icon: <Briefcase size={24} />, name: "Dashboard", href: "/dashboard" },
    { icon: <TrendingUp size={24} />, name: "Traderoom", href: "/traderoom" },
    { icon: <Newspaper size={24} />, name: "Market News", href: "/news" },
    { icon: <Settings size={24} />, name: "Settings", href: "/settings" },
  ];

  const adminItem = {
    icon: <Shield size={24} />,
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
              className="fixed inset-0 bg-black bg-opacity-50 z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSidebar}
            />

            {/* Sidebar */}
            <motion.div
              key="sidebar-content"
              data-tutorial="sidebar"
              className="fixed left-0 top-0 h-full bg-gray-800 text-white w-60 sm:w-72 p-4 sm:p-6 pt-20 flex flex-col z-[60]"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
            >
              <nav className="flex-1 overflow-y-auto">
                <ul>
                  {navItems.map((item) => (
                    <li key={item.name} className="mb-4 sm:mb-6">
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
                          // Trade link opens in new tab
                          <a
                            href={`${baseUrl}${item.href}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-2 sm:p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 group w-full"
                            onClick={closeSidebar}
                            onMouseEnter={() => setHoveredItem(item.name)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            <>
                              <motion.div
                                className="text-gray-300 group-hover:text-orange-500 transition-colors duration-300"
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
                                className="ml-3 sm:ml-4 text-base sm:text-lg text-gray-300 group-hover:text-orange-500 transition-colors duration-300"
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
                            </>
                          </a>
                        ) : (
                          // Regular Next.js Link for other navigation items
                          <Link
                            href={item.href}
                            className="flex items-center p-2 sm:p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 group"
                            onClick={closeSidebar}
                            onMouseEnter={() => setHoveredItem(item.name)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            {item.name === "Settings" ? (
                              // Special Settings item with synchronized hover effects
                              <>
                                <motion.div
                                  className="text-gray-300 group-hover:text-orange-500 transition-colors duration-300"
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
                                  className="ml-3 sm:ml-4 text-base sm:text-lg text-gray-300 group-hover:text-orange-500 transition-colors duration-300"
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
                              </>
                            ) : (
                              // Regular navigation items with synchronized hover effects
                              <>
                                <motion.div
                                  className="text-gray-300 group-hover:text-orange-500 transition-colors duration-300"
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
                                  className="ml-3 sm:ml-4 text-base sm:text-lg text-gray-300 group-hover:text-orange-500 transition-colors duration-300"
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
                              </>
                            )}
                          </Link>
                        )}
                      </motion.div>
                    </li>
                  ))}
                  {(session?.user?.role === "ADMIN" ||
                    session?.user?.role === "STAFF_ADMIN") && (
                    <li className="mb-6">
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
                          className="flex items-center p-2 sm:p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 group"
                          onClick={closeSidebar}
                          onMouseEnter={() => setHoveredItem(session?.user?.role === "STAFF_ADMIN" ? "Staff Admin" : "Admin")}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          <motion.div
                            className="text-gray-300 group-hover:text-orange-500 transition-colors duration-300"
                            animate={
                              hoveredItem === (session?.user?.role === "STAFF_ADMIN" ? "Staff Admin" : "Admin")
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
                            className="ml-3 sm:ml-4 text-base sm:text-lg text-gray-300 group-hover:text-orange-500 transition-colors duration-300"
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
                                hoveredItem === (session?.user?.role === "STAFF_ADMIN" ? "Staff Admin" : "Admin")
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
                              {session?.user?.role === "STAFF_ADMIN" ? "Staff Admin" : adminItem.name}
                            </motion.span>
                          </motion.span>
                        </Link>
                      </motion.div>
                    </li>
                  )}
                </ul>
              </nav>
              {/* Logout button at bottom */}
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700">
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
                    className="w-full flex items-center p-2 sm:p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 text-left group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onMouseEnter={() => setHoveredItem("Logout")}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <motion.div
                      className="text-red-400 group-hover:text-orange-500 transition-colors duration-300"
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
                      <LogOut size={22} />
                    </motion.div>
                    <motion.span
                      className="ml-3 sm:ml-4 text-base sm:text-lg text-red-400 group-hover:text-orange-500 transition-colors duration-300"
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
