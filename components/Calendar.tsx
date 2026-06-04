import React, { useState } from "react";

type LeaveRequest = {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  status: string;
};

type User = {
  id: number;
  name: string;
  color: string;
};

type Props = {
  requests: LeaveRequest[];
  users: User[];
  onDayClick: (year: number, month: number, day: number) => void;
};

export default function Calendar({ requests, users, onDayClick }: Props) {
  const [current, setCurrent] = useState(new Date());

  const year = current.getFullYear();
  const month = current.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = current.toLocaleString("default", { month: "long" });

  function getRequestsForDay(day: number) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return requests.filter(r =>
      r.status === "approved" && date >= r.start_date && date <= r.end_date
    ).map(r => ({
      ...r,
      user: users.find(u => u.id === r.user_id)
    }));
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrent(new Date(year, month - 1))}
          className="text-gray-400 hover:text-white px-3 py-1 rounded-lg hover:bg-gray-800"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-white">{monthName} {year}</h2>
        <button
          onClick={() => setCurrent(new Date(year, month + 1))}
          className="text-gray-400 hover:text-white px-3 py-1 rounded-lg hover:bg-gray-800"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="text-center text-gray-500 text-sm py-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayRequests = getRequestsForDay(day);
          return (
            <div
              key={day}
              className="min-h-16 bg-gray-800 rounded-lg p-1 cursor-pointer hover:bg-gray-700"
              onClick={() => onDayClick(year, month + 1, day)}
            >
              <span className="text-gray-400 text-sm">{day}</span>
              {dayRequests.map(r => (
                <div
                  key={r.id}
                  className="text-xs rounded px-1 py-0.5 mt-1 truncate"
                  style={{ backgroundColor: r.user?.color ?? "#3B82F6" }}
                >
                  {r.user?.name}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}