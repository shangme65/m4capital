"use client";
import { useState, useEffect } from "react";
import { User } from "@prisma/client";

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    }
    fetchUsers();
  }, []);

  const handleTopUp = async () => {
    if (!selectedUser || amount <= 0) {
      setMessage("Please select a user and enter a valid amount.");
      return;
    }

    setMessage("Processing...");
    const res = await fetch("/api/admin/top-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUser.id, amount }),
    });

    if (res.ok) {
      setMessage(
        `Successfully topped up ${selectedUser.email} with $${amount}.`
      );
      setAmount(0);
    } else {
      const error = await res.json();
      setMessage(`Failed to top up: ${error.error}`);
    }
  };

  return (
    <div className="text-white">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      {message && <p className="mb-4 text-yellow-400">{message}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Users</h2>
          <div className="bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto">
            <ul>
              {users.map((user) => (
                <li
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`cursor-pointer p-2 rounded ${
                    selectedUser?.id === user.id
                      ? "bg-indigo-600"
                      : "hover:bg-gray-700"
                  }`}
                >
                  {user.email} ({user.role})
                </li>
              ))}
            </ul>
          </div>
        </div>
        {selectedUser && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Top Up Balance</h2>
            <p className="mb-4">
              User: <span className="font-semibold">{selectedUser.email}</span>
            </p>
            <div className="flex items-center">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="bg-gray-700 text-white rounded-l-md p-2 w-full"
                placeholder="Amount"
              />
              <button
                onClick={handleTopUp}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-r-md"
              >
                Top Up
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
