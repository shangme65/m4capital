"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // Placeholder handlers (extend later)
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // TODO: implement profile update API
    setTimeout(() => setSaving(false), 800);
  };

  // Simple accordion section component (local to this page)
  const AccordionSection = ({
    id,
    title,
    children,
    defaultOpen = false,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
  }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
      <section className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <button
          type="button"
          {...(open
            ? { "aria-expanded": "true" }
            : { "aria-expanded": "false" })}
          aria-controls={`${id}-content`}
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-gray-750 text-left"
        >
          <span className="text-base sm:text-lg font-semibold">{title}</span>
          <svg
            className={`h-5 w-5 transition-transform duration-200 ${
              open ? "rotate-180" : "rotate-0"
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <div
          id={`${id}-content`}
          className={`${open ? "block" : "hidden"} border-t border-gray-700`}
        >
          <div className="p-4 sm:p-6">{children}</div>
        </div>
      </section>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 sm:space-y-8">
      {/* Back button */}
      <div className="mb-2">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700"
        >
          <span aria-hidden>←</span>
          <span>Back</span>
        </button>
      </div>

      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400 text-sm">
          Manage your account preferences and platform experience.
        </p>
      </header>

      {/* Accordion: Profile */}
      <AccordionSection id="profile" title="Profile">
        <form onSubmit={handleProfileSave} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              defaultValue={session?.user?.name || ""}
              className="w-full bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              disabled
              defaultValue={session?.user?.email || ""}
              className="w-full bg-gray-700 rounded-lg px-3 py-2 opacity-70 cursor-not-allowed"
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="accountType"
            >
              Account Type
            </label>
            <input
              id="accountType"
              type="text"
              disabled
              value={
                session?.user?.accountType
                  ? session.user.accountType.charAt(0) +
                    session.user.accountType.slice(1).toLowerCase()
                  : "Investor"
              }
              className="w-full bg-gray-700 rounded-lg px-3 py-2 opacity-70 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">
              Account type is chosen at signup. Contact support to change.
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </AccordionSection>

      {/* Accordion: Security */}
      <AccordionSection id="security" title="Security">
        <ul className="space-y-3 text-sm text-gray-300">
          <li>• Password change (coming soon)</li>
          <li>• Two-factor authentication (planned)</li>
          <li>• Active sessions / device management (planned)</li>
        </ul>
      </AccordionSection>

      {/* Accordion: Notifications */}
      <AccordionSection id="notifications" title="Notifications">
        <p className="text-sm text-gray-300 mb-4">
          Granular control over market alerts, portfolio events, and platform
          messages (coming soon).
        </p>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-700/50 rounded-lg p-4">
            Price Alerts (planned)
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            Portfolio Performance Digest (planned)
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            System Messages (planned)
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            Regulatory / Compliance Notices (planned)
          </div>
        </div>
      </AccordionSection>

      {/* Accordion: Preferences */}
      <AccordionSection id="preferences" title="Preferences">
        <ul className="space-y-3 text-sm text-gray-300">
          <li>• Theme (light/dark/auto)</li>
          <li>• Default dashboard layout</li>
          <li>• Data refresh interval</li>
          <li>• Currency & locale formatting</li>
        </ul>
      </AccordionSection>

      {/* Accordion: Data & Privacy */}
      <AccordionSection id="data-privacy" title="Data & Privacy">
        <ul className="space-y-3 text-sm text-gray-300">
          <li>• Download account data (planned)</li>
          <li>• Delete account request (planned)</li>
          <li>• Consent & regulatory disclosures</li>
        </ul>
      </AccordionSection>

      {/* Logout */}
      <section className="flex justify-end">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-red-400 hover:text-red-300 font-medium"
        >
          Log out
        </button>
      </section>
    </div>
  );
}
