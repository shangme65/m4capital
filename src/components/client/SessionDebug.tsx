"use client";
import { useSession } from "next-auth/react";

export default function SessionDebug() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading session...</div>;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 m-4">
      <h3 className="text-lg font-bold text-white mb-2">Session Debug Info</h3>
      <div className="text-sm text-gray-300">
        <p><strong>Status:</strong> {status}</p>
        {session ? (
          <>
            <p><strong>Email:</strong> {session.user?.email}</p>
            <p><strong>Name:</strong> {session.user?.name}</p>
            <p><strong>Role:</strong> {session.user?.role}</p>
            <p><strong>Account Type:</strong> {session.user?.accountType}</p>
            <p><strong>User ID:</strong> {session.user?.id}</p>
            <div className="mt-2">
              <strong>Full Session:</strong>
              <pre className="text-xs bg-gray-900 p-2 rounded mt-1 overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          </>
        ) : (
          <p>No session found</p>
        )}
      </div>
    </div>
  );
}