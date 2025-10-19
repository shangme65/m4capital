import React from "react";

export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">
        This Privacy Policy explains how M4Capital collects, uses, and protects
        your information when you use our platform.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">
        Information We Collect
      </h2>
      <ul className="list-disc ml-6 mb-4">
        <li>
          Email address, name, and profile information (when you sign up or log
          in)
        </li>
        <li>Usage data and analytics</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">
        How We Use Your Information
      </h2>
      <ul className="list-disc ml-6 mb-4">
        <li>To provide and improve our services</li>
        <li>To authenticate users and secure accounts</li>
        <li>To comply with legal obligations</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">Data Protection</h2>
      <p className="mb-4">
        We use industry-standard security measures to protect your data. We do
        not sell your personal information to third parties.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">Your Rights</h2>
      <p className="mb-4">
        You may request access, correction, or deletion of your personal data at
        any time. See our{" "}
        <a href="/data-deletion" className="text-blue-600 underline">
          Data Deletion page
        </a>{" "}
        for instructions.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">Contact</h2>
      <p>
        If you have questions, contact us at{" "}
        <a
          href="mailto:support@m4capital.online"
          className="text-blue-600 underline"
        >
          support@m4capital.online
        </a>
        .
      </p>
    </main>
  );
}
