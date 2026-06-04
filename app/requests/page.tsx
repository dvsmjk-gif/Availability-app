"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

type LeaveRequest = {
  id: number;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    fetch("/api/leave")
      .then(r => r.json())
      .then(data => setRequests(data));
  }, []);

  function statusColor(status: string) {
    if (status === "approved") return "text-green-400";
    if (status === "rejected") return "text-red-400";
    return "text-yellow-400";
  }

  async function handleDelete(id: number) {
  await fetch(`/api/leave/${id}`, { method: "DELETE" });
  setRequests(prev => prev.filter(r => r.id !== id));
}

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">My Requests</h1>
        {requests.length === 0 && <p className="text-gray-500">No requests yet.</p>}
        <div className="flex flex-col gap-4">
          {requests.map(r => (
            <div key={r.id} className="bg-gray-900 rounded-2xl p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-semibold">{r.start_date} — {r.end_date}</p>
                  <p className="text-gray-400 text-sm mt-1">{r.start_time} to {r.end_time}</p>
                  {r.rejection_reason && (
                    <p className="text-red-400 text-sm mt-2">Reason: {r.rejection_reason}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-sm font-medium capitalize ${statusColor(r.status)}`}>
                    {r.status}
                  </span>
                  {r.status === "pending" && (
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Cancel request
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );}