"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "success";
}

/**
 * React 19 SubmitButton with useFormStatus
 * Automatically shows loading state when form is submitting
 * Works with Server Actions and form actions
 */
export function SubmitButton({
  children,
  pendingText = "Processing...",
  className = "",
  disabled = false,
  variant = "primary",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  const baseStyles =
    "relative flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50";

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/25",
    secondary:
      "bg-gray-700 text-white hover:bg-gray-600 border border-gray-600",
    danger:
      "bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/25",
    success:
      "bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400 shadow-lg shadow-green-500/25",
  };

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={{
        boxShadow: pending
          ? "none"
          : "0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
      }}
    >
      {pending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{pendingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Form Action Button - for use with form action={serverAction}
 * Shows visual feedback based on pending state
 */
export function FormActionButton({
  children,
  pendingText,
  className = "",
  variant = "primary",
}: SubmitButtonProps) {
  const { pending, data, method, action } = useFormStatus();

  const baseStyles =
    "w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all duration-300";

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500",
    secondary: "bg-gray-700 text-white hover:bg-gray-600",
    danger:
      "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500",
    success:
      "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500",
  };

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${baseStyles} ${variantStyles[variant]} ${className} ${
        pending ? "animate-pulse opacity-80" : ""
      }`}
    >
      {pending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          {pendingText || "Submitting..."}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Icon Submit Button - Compact button with just an icon
 */
export function IconSubmitButton({
  icon,
  pendingIcon,
  className = "",
  ariaLabel,
}: {
  icon: React.ReactNode;
  pendingIcon?: React.ReactNode;
  className?: string;
  ariaLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={ariaLabel}
      className={`rounded-lg p-2 transition-all ${className} ${
        pending ? "animate-pulse" : ""
      }`}
    >
      {pending
        ? pendingIcon || <Loader2 className="h-5 w-5 animate-spin" />
        : icon}
    </button>
  );
}
