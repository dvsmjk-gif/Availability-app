"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

type LeaveRequest = {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  status: string;
  user_name?: string;
};

export default function AdminPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [rejectionReason, setRejectionReason] = useState<{ [id: number]: string }>({});

  useEffect(() => {
    fetch("/api/leave")
      .then(r => r.json())
      .then(data => setRequests(data));
  }, []);

  async function fetchRequests() {
    fetch("/api/leave")
      .then(r => r.json())
      .then(data => setRequests(data));
  }

  async function handleAction(id: number, status: "approved" | "rejected") {
    await fetch(`/api/leave/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rejection_reason: rejectionReason[id] ?? null }),
    });
    fetchRequests();
  }

  const pending = requests.filter(r => r.status === "pending");

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Admin — Leave Requests</h1>
        {pending.length === 0 && <p className="text-gray-500">No pending requests.</p>}
        <div className="flex flex-col gap-4">
          {pending.map(r => (
            <div key={r.id} className="bg-gray-900 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-white font-semibold">User ID: {r.user_id}</p>
                  <p className="text-gray-400 text-sm">{r.start_date} {r.start_time} — {r.end_date} {r.end_time}</p>
                </div>
                <span className="text-yellow-400 text-sm font-medium">Pending</span>
              </div>
              <input
                type="text"
                placeholder="Rejection reason (optional)"
                value={rejectionReason[r.id] ?? ""}
                onChange={(e) => setRejectionReason(prev => ({ ...prev, [r.id]: e.target.value }))}
                className="bg-gray-800 text-white placeholder-gray-500 px-4 py-2 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(r.id, "approved")}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(r.id, "rejected")}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}