import { redirect } from "next/navigation";

/**
 * Standalone Deposit Page
 *
 * This page is shown when /deposit is accessed directly (not intercepted).
 * It redirects to the dashboard where the deposit modal can be opened.
 */
export default function DepositPage() {
  // Redirect to dashboard - the modal will be triggered via URL param
  redirect("/dashboard?action=deposit");
}
