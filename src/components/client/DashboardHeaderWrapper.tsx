"use client";

import { usePathname } from "next/navigation";
import DashboardHeader from "./DashboardHeader";

export default function DashboardHeaderWrapper() {
  const pathname = usePathname();
  const hideOnNews = pathname?.startsWith("/news");
  const hideOnTraderoom = pathname?.startsWith("/traderoom");
  const hideOnStaffAdmin = pathname?.startsWith("/staff-admin");
  if (hideOnNews || hideOnTraderoom || hideOnStaffAdmin) return null;
  return <DashboardHeader />;
}
