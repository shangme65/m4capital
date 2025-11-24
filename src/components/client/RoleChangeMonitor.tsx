"use client";

import { useRoleChangeDetection } from "@/hooks/useRoleChangeDetection";

export function RoleChangeMonitor() {
  // Check for role changes every 5 seconds
  useRoleChangeDetection(5000);

  return null; // This component doesn't render anything
}
