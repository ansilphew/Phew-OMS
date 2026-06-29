"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/api";

export default function SupportPage() {
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
      <h2 className="text-xl font-bold text-[#1f1f1f] mb-2">Help & Support</h2>
      <p className="text-sm text-[#9a9a9a]">Submit tickets, view knowledge bases, or chat directly with our help center agent.</p>
      
      <div className="mt-8 border border-dashed border-[#e2e8f0] rounded-xl p-12 text-center text-slate-400">
        Support desk is currently online. Contact email: support@phew.agency
      </div>
    </div>
  );
}
