"use client";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);

  // Placeholder handlers (extend later)
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // TODO: implement profile update API
    setTimeout(() => setSaving(false), 800);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400 text-sm">
          Manage your account preferences and platform experience.
        </p>
      </header>

      {/* 1. Profile / Identity */}
      <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Profile</h2>
        <form onSubmit={handleProfileSave} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              defaultValue={session?.user?.name || ""}
              className="w-full bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              disabled
              defaultValue={session?.user?.email || ""}
              className="w-full bg-gray-700 rounded-lg px-3 py-2 opacity-70 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Account Type
            </label>
            <input
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
      </section>

      {/* 2. Security */}
      <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Security</h2>
        <ul className="space-y-3 text-sm text-gray-300">
          <li>• Password change (coming soon)</li>
          <li>• Two-factor authentication (planned)</li>
          <li>• Active sessions / device management (planned)</li>
        </ul>
      </section>

      {/* 3. Notifications */}
      <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
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
      </section>

      {/* 4. Preferences */}
      <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Preferences</h2>
        <ul className="space-y-3 text-sm text-gray-300">
          <li>• Theme (light/dark/auto)</li>
          <li>• Default dashboard layout</li>
          <li>• Data refresh interval</li>
          <li>• Currency & locale formatting</li>
        </ul>
      </section>

      {/* 5. Data & Privacy */}
      <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Data & Privacy</h2>
        <ul className="space-y-3 text-sm text-gray-300">
          <li>• Download account data (planned)</li>
          <li>• Delete account request (planned)</li>
          <li>• Consent & regulatory disclosures</li>
        </ul>
      </section>

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
