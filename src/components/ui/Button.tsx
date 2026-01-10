"use client";

import { motion } from "framer-motion";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface AnimatedButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    | "onDrag"
    | "onDragStart"
    | "onDragEnd"
    | "onAnimationStart"
    | "onAnimationEnd"
    | "onAnimationIteration"
  > {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "sm",
      isLoading,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative overflow-hidden font-semibold transition-shadow duration-500 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform-gpu perspective-1000";

    const variants = {
      primary: clsx(
        // Orange gradient with darker bottom
        "bg-gradient-to-b from-orange-600 to-orange-800",
        // Dark bottom shadow in default state (darker orange)
        "shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.2),0_8px_0_0_rgba(80,20,3,1),0_10px_8px_-2px_rgba(0,0,0,0.5),0_15px_25px_-5px_rgba(0,0,0,0.4)]",
        // Hover state - orange glow at bottom
        "hover:shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.2),0_8px_0_0_rgba(249,115,22,0.8),0_10px_8px_-2px_rgba(249,115,22,0.6),0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_50px_rgba(249,115,22,0.5)]",
        "hover:translate-y-[2px]",
        // Text
        "text-white border-0"
      ),
      secondary: clsx(
        "bg-gradient-to-b from-gray-600 via-gray-700 via-50% to-gray-800",
        "shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.15),0_8px_0_0_#111827,0_10px_8px_-2px_rgba(0,0,0,0.4),0_15px_25px_-5px_rgba(0,0,0,0.3)]",
        "hover:shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.15),0_6px_0_0_rgba(107,114,128,0.8),0_8px_6px_-2px_rgba(0,0,0,0.4),0_12px_20px_-5px_rgba(0,0,0,0.3)]",
        "hover:translate-y-[2px]",
        "active:shadow-[inset_0_2px_8px_0_rgba(0,0,0,0.25),0_1px_0_0_#111827,0_2px_3px_-1px_rgba(0,0,0,0.4)]",
        "active:translate-y-[7px]",
        "text-white border-0"
      ),
      outline: clsx(
        // Solid gray-500 background
        "bg-gray-500",
        // Simple shadows without inset effects
        "shadow-[0_8px_0_0_#111827,0_10px_8px_-2px_rgba(0,0,0,0.5)]",
        // Hover state - gray glow
        "hover:!shadow-[0_8px_0_0_rgba(107,114,128,0.8),0_10px_8px_-2px_rgba(107,114,128,0.6),0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_50px_rgba(107,114,128,0.5)]",
        // Text and border
        "text-white border-0"
      ),
      ghost: "text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs rounded-lg",
      md: "px-7 py-2.5 text-base rounded-xl",
      lg: "px-9 py-3.5 text-lg rounded-2xl",
    };

    return (
      <motion.button
        ref={ref}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        whileHover={{
          rotateX: -2,
          transition: { duration: 0.15 },
        }}
        whileTap={{
          rotateX: 5,
          scale: 0.95,
          transition: { 
            duration: 0.1,
            type: "spring",
            stiffness: 400,
            damping: 17
          },
        }}
        animate={{
          scale: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        style={{ transformStyle: "preserve-3d" }}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Loading...
          </div>
        ) : (
          <div className="relative z-10 flex items-center justify-center gap-2">
            {children}
          </div>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;
