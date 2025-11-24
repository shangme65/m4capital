"use client";

import { usePathname } from "next/navigation";
import DashboardHeader from "./DashboardHeader";

export default function DashboardHeaderWrapper() {
  const pathname = usePathname();
  const hideOnSettings = pathname?.startsWith("/settings");
  const hideOnNews = pathname?.startsWith("/news");
  const hideOnTraderoom = pathname?.startsWith("/traderoom");
  const hideOnStaffAdmin = pathname?.startsWith("/staff-admin");
  if (hideOnSettings || hideOnNews || hideOnTraderoom || hideOnStaffAdmin)
    return null;
  return <DashboardHeader />;
}
