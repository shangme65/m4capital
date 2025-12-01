"use client";

import { useRoleChangeDetection } from "@/hooks/useRoleChangeDetection";

export function RoleChangeMonitor() {
  // Check for role changes every 60 seconds (reduced from 5s to prevent API spam)
  useRoleChangeDetection(60000);

  return null; // This component doesn't render anything
}
