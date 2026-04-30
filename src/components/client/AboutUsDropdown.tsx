"use client";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";

const AboutUsDropdown = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-max min-w-[200px]">
      <div
        className={`backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden p-4 ${
          isDark
            ? "bg-[#1a1a1a]/95 text-white border border-white/[0.06]"
            : "bg-white text-gray-900 border border-gray-200"
        }`}
      >
        <ul className="space-y-1">
          <li>
            <Link
              href="/in-numbers"
              className={`block px-4 py-2.5 text-[14px] rounded-lg transition-colors ${
                isDark
                  ? "text-white/80 hover:text-[#ff8516] hover:bg-white/[0.05]"
                  : "text-gray-700 hover:text-[#ff660f] hover:bg-gray-100"
              }`}
            >
              In Numbers
            </Link>
          </li>
          <li>
            <Link
              href="/press"
              className={`block px-4 py-2.5 text-[14px] rounded-lg transition-colors ${
                isDark
                  ? "text-white/80 hover:text-[#ff8516] hover:bg-white/[0.05]"
                  : "text-gray-700 hover:text-[#ff660f] hover:bg-gray-100"
              }`}
            >
              In the Press
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className={`block px-4 py-2.5 text-[14px] rounded-lg transition-colors ${
                isDark
                  ? "text-white/80 hover:text-[#ff8516] hover:bg-white/[0.05]"
                  : "text-gray-700 hover:text-[#ff660f] hover:bg-gray-100"
              }`}
            >
              Contact Us
            </Link>
          </li>
          <li>
            <Link
              href="/awards"
              className={`block px-4 py-2.5 text-[14px] rounded-lg transition-colors ${
                isDark
                  ? "text-white/80 hover:text-[#ff8516] hover:bg-white/[0.05]"
                  : "text-gray-700 hover:text-[#ff660f] hover:bg-gray-100"
              }`}
            >
              Awards
            </Link>
          </li>
          <li>
            <Link
              href="/licenses-and-safeguards"
              className={`block px-4 py-2.5 text-[14px] rounded-lg transition-colors ${
                isDark
                  ? "text-white/80 hover:text-[#ff8516] hover:bg-white/[0.05]"
                  : "text-gray-700 hover:text-[#ff660f] hover:bg-gray-100"
              }`}
            >
              Licenses and Safeguards
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AboutUsDropdown;
