"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/api";

export default function SettingsPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getCurrentUser();
        setUser(data.user);
      } catch (err) {
        console.error(err);
      }
    }
    loadUser();
  }, []);

  return (
    <div className="rounded-xl border border-[#eef0f3] bg-white p-8">
      <h2 className="app-heading-medium mb-2">Account Settings</h2>
      <p className="app-body-muted">Manage your credentials, configuration, and notification preferences.</p>
      
      <div className="mt-8 grid gap-6 max-w-xl">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Current User</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">{user?.fullName || "Loading..."}</p>
        </div>
      </div>
    </div>
  );
}
