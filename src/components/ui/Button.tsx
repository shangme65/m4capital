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
        // Gradient from Halo - left to right like Save button
        "bg-gradient-to-r from-primary-600 to-primary-700",
        // Dark bottom shadow in default state (dark green #14532d)
        "shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.2),0_8px_0_0_#14532d,0_10px_8px_-2px_rgba(0,0,0,0.4),0_15px_25px_-5px_rgba(0,0,0,0.3)]",
        // Hover state - green glow at bottom like Save button
        "hover:shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.2),0_8px_0_0_rgba(34,197,94,0.8),0_10px_8px_-2px_rgba(34,197,94,0.6),0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_50px_rgba(34,197,94,0.5)]",
        "hover:translate-y-[2px]",
        // Text
        "text-white border-0"
      ),
      secondary: clsx(
        "bg-gradient-to-b from-green-600 via-green-700 via-50% to-green-800",
        "shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.15),0_8px_0_0_rgba(156,163,175,1),0_10px_8px_-2px_rgba(0,0,0,0.4),0_15px_25px_-5px_rgba(0,0,0,0.3)]",
        "hover:shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.15),0_6px_0_0_rgba(156,163,175,1),0_8px_6px_-2px_rgba(0,0,0,0.4),0_12px_20px_-5px_rgba(0,0,0,0.3)]",
        "hover:translate-y-[2px]",
        "active:shadow-[inset_0_2px_8px_0_rgba(0,0,0,0.25),0_1px_0_0_rgba(156,163,175,1),0_2px_3px_-1px_rgba(0,0,0,0.4)]",
        "active:translate-y-[7px]",
        "text-white border-0"
      ),
      outline: clsx(
        // Metallic gradient with shine effect
        "bg-gradient-to-b from-gray-500 via-gray-500 via-40% to-gray-700 bg-clip-padding",
        // Dark bottom shadow in default state
        "shadow-[inset_0_-3px_2px_0_rgba(0,0,0,0.3),inset_2px_0_2px_0_rgba(255,255,255,0.1),inset_-2px_0_2px_0_rgba(0,0,0,0.1),0_4px_0_0_#2a2a2a,0_5px_0_0_#1a1a1a,0_6px_8px_-2px_rgba(0,0,0,0.4)]",
        // Hover state - green glow from Halo hero edit Back button
        "hover:!shadow-[inset_0_-3px_2px_0_rgba(0,0,0,0.25),inset_2px_0_2px_0_rgba(255,255,255,0.15),inset_-2px_0_2px_0_rgba(0,0,0,0.1),0_4px_0_0_rgba(34,197,94,0.8),0_5px_0_0_rgba(34,197,94,0.6),0_6px_0_0_rgba(34,197,94,0.4),0_10px_12px_-3px_rgba(0,0,0,0.5),0_15px_25px_-5px_rgba(0,0,0,0.3),0_8px_16px_-4px_rgba(34,197,94,0.7)]",
        // Text and border
        "text-white border-0"
      ),
      ghost: "text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950",
    };

    const sizes = {
      sm: "px-3 py-1 text-xs rounded-lg",
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
          transition: { duration: 0.1 },
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
          <>
            {/* Shine/reflection effect */}
            <div className="absolute inset-0 overflow-hidden rounded-inherit">
              <div className="absolute -top-1/2 -left-1/4 w-[150%] h-full bg-gradient-to-br from-white/30 via-white/10 to-transparent rotate-12 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </div>

            {/* Top highlight line */}
            <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

            {/* Content */}
            <div
              className="relative z-10 flex items-center justify-center gap-2"
              style={{ transform: "translateZ(2px)" }}
            >
              {children}
            </div>

            {/* Bottom inner shadow */}
            <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;
