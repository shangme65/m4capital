import React from "react";

export default function DataDeletionPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Data Deletion Instructions</h1>
      <p className="mb-4">
        If you wish to delete your account and personal data from M4Capital,
        please follow these steps:
      </p>
      <ol className="list-decimal ml-6 mb-4">
        <li>
          Email your request to{" "}
          <a
            href="mailto:support@m4capital.online"
            className="text-blue-600 underline"
          >
            support@m4capital.online
          </a>{" "}
          from the email address associated with your account.
        </li>
        <li>
          We will verify your identity and process your request within 7
          business days.
        </li>
        <li>
          All personal data associated with your account will be permanently
          deleted.
        </li>
      </ol>
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
