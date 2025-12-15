"use client";

import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * React 19 / Next.js 16 View Transitions Hook
 *
 * Uses the View Transitions API for smooth page transitions
 * with startTransition for non-blocking navigation
 *
 * @example
 * const { navigate, isPending } = useViewTransition();
 *
 * <button onClick={() => navigate('/dashboard')} disabled={isPending}>
 *   {isPending ? 'Loading...' : 'Go to Dashboard'}
 * </button>
 */
export function useViewTransition() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback(
    (href: string, options?: { scroll?: boolean }) => {
      // Check if View Transitions API is supported
      if (
        typeof document !== "undefined" &&
        "startViewTransition" in document
      ) {
        // Use View Transitions API for smooth transition
        (document as any).startViewTransition(() => {
          startTransition(() => {
            router.push(href, options);
          });
        });
      } else {
        // Fallback to regular transition
        startTransition(() => {
          router.push(href, options);
        });
      }
    },
    [router]
  );

  const replace = useCallback(
    (href: string, options?: { scroll?: boolean }) => {
      if (
        typeof document !== "undefined" &&
        "startViewTransition" in document
      ) {
        (document as any).startViewTransition(() => {
          startTransition(() => {
            router.replace(href, options);
          });
        });
      } else {
        startTransition(() => {
          router.replace(href, options);
        });
      }
    },
    [router]
  );

  const back = useCallback(() => {
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      (document as any).startViewTransition(() => {
        startTransition(() => {
          router.back();
        });
      });
    } else {
      startTransition(() => {
        router.back();
      });
    }
  }, [router]);

  return {
    navigate,
    replace,
    back,
    isPending,
  };
}

/**
 * Link component with View Transitions
 * Wraps navigation in startViewTransition for smooth animations
 */
export { useViewTransition as useNavigationTransition };
