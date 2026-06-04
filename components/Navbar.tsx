"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  role: string;
};

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => setUser(data));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="text-white font-bold text-lg">LeaveApp</span>
        <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">
          Dashboard
        </Link>
        {user && user.role !== "employee" && (
          <Link href="/admin" className="text-gray-400 hover:text-white text-sm">
            Admin
          </Link>
        )}
        <Link href="/requests" className="text-gray-400 hover:text-white text-sm">
  My Requests
</Link>
      </div>
      <div className="flex items-center gap-4">
        {user && <span className="text-gray-500 text-sm">{user.name}</span>}
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-white text-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}