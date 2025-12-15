"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Web Vitals Reporter Component
 *
 * Reports Core Web Vitals to your analytics service
 * Include this component in your root layout
 *
 * Metrics reported:
 * - LCP (Largest Contentful Paint) - loading performance
 * - FID (First Input Delay) - interactivity
 * - CLS (Cumulative Layout Shift) - visual stability
 * - FCP (First Contentful Paint) - initial render
 * - TTFB (Time to First Byte) - server response
 * - INP (Interaction to Next Paint) - responsiveness
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Web Vital] ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating, // 'good', 'needs-improvement', or 'poor'
        delta: metric.delta,
        id: metric.id,
      });
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === "production") {
      // Example: Send to Google Analytics
      // window.gtag?.('event', metric.name, {
      //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      //   event_label: metric.id,
      //   non_interaction: true,
      // });

      // Example: Send to custom endpoint
      // fetch('/api/analytics/vitals', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     name: metric.name,
      //     value: metric.value,
      //     rating: metric.rating,
      //     delta: metric.delta,
      //     id: metric.id,
      //     page: window.location.pathname,
      //   }),
      //   keepalive: true,
      // });

      // Log to console for now (replace with actual analytics)
      if (metric.rating === "poor") {
        console.warn(`[Poor Web Vital] ${metric.name}:`, metric.value);
      }
    }
  });

  return null;
}

/**
 * Helper to categorize metric quality
 */
export function getMetricRating(
  name: string,
  value: number
): "good" | "needs-improvement" | "poor" {
  const thresholds: Record<string, [number, number]> = {
    LCP: [2500, 4000],
    FID: [100, 300],
    CLS: [0.1, 0.25],
    FCP: [1800, 3000],
    TTFB: [800, 1800],
    INP: [200, 500],
  };

  const [good, poor] = thresholds[name] || [Infinity, Infinity];

  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}
