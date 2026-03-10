"use client";

import { useEffect, useCallback, useRef } from "react";

/**
 * EmergencyUiReset Component
 * 
 * Provides an escape hatch when the UI becomes unresponsive due to:
 * - Stuck modals with body overflow: hidden
 * - Invisible overlays blocking interaction
 * - Multiple scroll locks conflicting
 * 
 * Press Escape 3 times quickly (within 1.5 seconds) to trigger emergency reset.
 */
export default function EmergencyUiReset() {
  const escapeCountRef = useRef(0);
  const escapeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const performEmergencyReset = useCallback(() => {
    console.log("🚨 Emergency UI Reset triggered!");
    
    // 1. Reset body styles that might be blocking
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    
    // 2. Remove any inline overflow styles from html element
    document.documentElement.style.overflow = "";
    
    // 3. Try to close any open modals by clicking their close buttons or backdrops
    // Find and click any visible close buttons
    const closeButtons = document.querySelectorAll('[data-close-modal], [aria-label*="close"], [aria-label*="Close"]');
    closeButtons.forEach((btn) => {
      if (btn instanceof HTMLElement && btn.offsetParent !== null) {
        console.log("Clicking close button:", btn);
        btn.click();
      }
    });
    
    // 4. Click any modal backdrops
    const backdrops = document.querySelectorAll('[data-modal-backdrop]');
    backdrops.forEach((backdrop) => {
      if (backdrop instanceof HTMLElement && backdrop.offsetParent !== null) {
        console.log("Clicking backdrop:", backdrop);
        backdrop.click();
      }
    });
    
    // 5. Remove any elements that might be blocking interaction
    const blockingElements = document.querySelectorAll('[data-blocking-overlay]');
    blockingElements.forEach((el) => {
      console.log("Removing blocking element:", el);
      el.remove();
    });
    
    // 6. Dispatch custom event that other components can listen to
    window.dispatchEvent(new CustomEvent("emergency-ui-reset"));
    
    // 7. Force a small delay then try scrolling
    setTimeout(() => {
      window.scrollTo(0, window.scrollY);
      // Try to focus on the main content
      const mainContent = document.querySelector('main');
      if (mainContent instanceof HTMLElement) {
        mainContent.focus();
      }
    }, 100);
    
    // Show visual feedback
    const feedback = document.createElement("div");
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 16px 32px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      z-index: 999999999;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      animation: fadeInOut 2s ease-in-out forwards;
    `;
    feedback.textContent = "✓ UI Reset Complete";
    document.body.appendChild(feedback);
    
    // Add animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      }
    `;
    document.head.appendChild(style);
    
    // Remove feedback after animation
    setTimeout(() => {
      feedback.remove();
      style.remove();
    }, 2000);
    
    // Reset escape counter
    escapeCountRef.current = 0;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        escapeCountRef.current += 1;
        
        // Clear previous timer
        if (escapeTimerRef.current) {
          clearTimeout(escapeTimerRef.current);
        }
        
        // If we've hit 3 escapes, trigger reset
        if (escapeCountRef.current >= 3) {
          performEmergencyReset();
          return;
        }
        
        // Reset counter after 1.5 seconds of no escapes
        escapeTimerRef.current = setTimeout(() => {
          escapeCountRef.current = 0;
        }, 1500);
      }
    };

    // Also listen for a special key combo: Ctrl+Shift+R (but not the browser refresh)
    const handleKeyCombo = (e: KeyboardEvent) => {
      // Alt + Shift + U for UI reset
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === "u") {
        e.preventDefault();
        performEmergencyReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keydown", handleKeyCombo);

    // Periodic check for stuck overflow (every 2 seconds)
    const overflowCheck = setInterval(() => {
      const bodyOverflow = document.body.style.overflow;
      
      // Only check if body is locked
      if (bodyOverflow !== "hidden") return;
      
      // Check for visible modal/overlay elements
      const hasVisibleModal = document.querySelector('[role="dialog"][aria-modal="true"]');
      const hasVisibleOverlay = document.querySelector('[data-tutorial-overlay="true"]');
      const hasAnimatePresence = document.querySelector('[data-framer-appear-id]');
      
      // Check for any open modal classes
      const hasOpenModal = document.querySelector('.fixed.inset-0.z-\\[10000\\]') ||
                          document.querySelector('.fixed.inset-0.z-\\[99999\\]') ||
                          document.querySelector('.fixed.inset-0.z-\\[100\\]');
      
      // If body is locked but no visible modal/overlay exists, check more carefully
      if (!hasVisibleModal && !hasVisibleOverlay && !hasAnimatePresence) {
        // Check if there are any fixed positioned elements with high z-index that are actually visible
        const fixedElements = document.querySelectorAll('[class*="fixed"][class*="inset-0"]');
        let hasVisibleBlocker = false;
        
        fixedElements.forEach((el) => {
          if (el instanceof HTMLElement) {
            const style = window.getComputedStyle(el);
            const isVisible = style.display !== "none" && 
                            style.visibility !== "hidden" && 
                            style.opacity !== "0" &&
                            el.offsetWidth > 0 &&
                            el.offsetHeight > 0;
            if (isVisible) {
              hasVisibleBlocker = true;
            }
          }
        });
        
        if (!hasVisibleBlocker && !hasOpenModal) {
          console.warn("⚠️ Auto-fixing stuck body overflow (no visible blockers found)");
          document.body.style.overflow = "";
        }
      }
    }, 2000);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keydown", handleKeyCombo);
      if (escapeTimerRef.current) {
        clearTimeout(escapeTimerRef.current);
      }
      clearInterval(overflowCheck);
    };
  }, [performEmergencyReset]);

  // This component renders nothing
  return null;
}
