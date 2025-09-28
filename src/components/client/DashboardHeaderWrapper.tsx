"use client";

import { usePathname } from "next/navigation";
import DashboardHeader from "./DashboardHeader";

export default function DashboardHeaderWrapper() {
  const pathname = usePathname();
  const hideOnSettings = pathname?.startsWith("/settings");
  if (hideOnSettings) return null;
  return <DashboardHeader />;
}
