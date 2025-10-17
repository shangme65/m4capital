"use client";

import { usePathname } from "next/navigation";
import DashboardHeader from "./DashboardHeader";

export default function DashboardHeaderWrapper() {
  const pathname = usePathname();
  const hideOnSettings = pathname?.startsWith("/settings");
  const hideOnNews = pathname?.startsWith("/news");
  const hideOnTrade = pathname?.startsWith("/trade");
  if (hideOnSettings || hideOnNews || hideOnTrade) return null;
  return <DashboardHeader />;
}
