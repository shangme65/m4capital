"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

/**
 * React 19 View Transitions Hook
 * Provides smooth transitions when navigating between routes
 */
export function useNavigationTransition() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigate = (href: string) => {
    startTransition(() => {
      router.push(href);
    });
  };

  const navigateBack = () => {
    startTransition(() => {
      router.back();
    });
  };

  const navigateReplace = (href: string) => {
    startTransition(() => {
      router.replace(href);
    });
  };

  return {
    navigate,
    navigateBack,
    navigateReplace,
    isPending,
  };
}

/**
 * Navigation Link Component with View Transitions
 * Use this instead of Next.js Link for smooth animated transitions
 */
interface TransitionLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TransitionLink({
  href,
  children,
  className,
  onClick,
}: TransitionLinkProps) {
  const { navigate, isPending } = useNavigationTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick();
    navigate(href);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`${className} ${
        isPending ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {children}
    </a>
  );
}
