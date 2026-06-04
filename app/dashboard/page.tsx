"use client";

import React, { useEffect, useState } from "react";
import Calendar from "@/components/Calendar";
import LeaveModal from "@/components/LeaveModal";
import Navbar from "@/components/Navbar";

export default function DashboardPage() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedDay, setSelectedDay] = useState<{ year: number; month: number; day: number } | null>(null);
  const [currentUser, setCurrentUser] = useState<{ name: string; days_off_remaining: number } | null>(null);

  async function fetchRequests() {
    fetch("/api/leave").then(r => r.json()).then(setRequests);
  }

  useEffect(() => {
    fetch("/api/leave")
      .then(r => r.json())
      .then(data => setRequests(data));
    fetch("/api/users").then(r => r.json()).then(setUsers);
    fetch("/api/auth/me").then(r => r.json()).then(setCurrentUser);
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        {currentUser && (
          <div className="mb-6 bg-gray-900 rounded-2xl p-4 inline-block">
            <p className="text-gray-400 text-sm">Remaining days off</p>
            <p className="text-white text-3xl font-bold">{currentUser.days_off_remaining}</p>
          </div>
        )}
        <Calendar
          requests={requests}
          users={users}
          onDayClick={(year, month, day) => setSelectedDay({ year, month, day })}
        />
        {selectedDay && (
          <LeaveModal
            year={selectedDay.year}
            month={selectedDay.month}
            day={selectedDay.day}
            onClose={() => setSelectedDay(null)}
            onSubmit={() => {
              setSelectedDay(null);
              fetchRequests();
            }}
          />
        )}
      </div>
    </>
  );
}