"use client";

import { useRoleChangeDetection } from "@/hooks/useRoleChangeDetection";

export function RoleChangeMonitor() {
  // Check for role changes and deleted accounts every 10 seconds
  // This ensures users are logged out promptly when their account is deleted
  useRoleChangeDetection(10000);

  return null; // This component doesn't render anything
}
