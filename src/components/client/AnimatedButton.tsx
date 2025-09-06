"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface AnimatedButtonProps {
  href?: string;
  text: string;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary";
  className?: string;
}

export default function AnimatedButton({
  href,
  text,
  type = "button",
  variant = "primary",
  className = ""
}: AnimatedButtonProps) {
  const primaryClasses = "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white";
  const secondaryClasses = "bg-transparent border-2 border-white text-white";

  const buttonContent = (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        px-8 py-3 rounded-full font-semibold transition-all duration-300
        shadow-lg hover:shadow-xl
        animate-gradient-x
        ${variant === 'primary' ? primaryClasses : secondaryClasses}
        ${className}
      `}
      type={type}
    >
      {text}
    </motion.button>
  );

  if (href) {
    return <Link href={href}>{buttonContent}</Link>;
  }

  return buttonContent;
}