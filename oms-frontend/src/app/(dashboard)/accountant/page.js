"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/auth/ProtectedPage";
import { getCurrentUser } from "@/lib/api";
import { FileText, BadgePercent, ShieldAlert, CreditCard } from "lucide-react";

export default function AccountantPage() {
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
    <ProtectedPage allowedRole="Accountant">
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[#2b0a38] to-[#7a1e9f] p-8 text-white shadow-sm">
          <h1 className="text-2xl font-bold">Welcome Back, {user?.fullName || "Accountant"}!</h1>
          <p className="mt-2 text-sm text-white/80">Manage your collections, invoice generated ledgers, and accounts billing cycle.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[#eef0f3] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Issued Invoices</span>
              <FileText className="h-5 w-5 text-[#65008c]" />
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-800">32</p>
            <span className="text-xs text-green-500 font-medium">↑ 4 new this cycle</span>
          </div>

          <div className="rounded-xl border border-[#eef0f3] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Collected</span>
              <CreditCard className="h-5 w-5 text-[#65008c]" />
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-800">$29,120</p>
            <span className="text-xs text-green-500 font-medium">92% target achieved</span>
          </div>

          <div className="rounded-xl border border-[#eef0f3] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tax Allocations</span>
              <BadgePercent className="h-5 w-5 text-[#65008c]" />
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-800">18%</p>
            <span className="text-xs text-slate-400">Within statutory limit</span>
          </div>

          <div className="rounded-xl border border-[#eef0f3] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overdue Payments</span>
              <ShieldAlert className="h-5 w-5 text-[#65008c]" />
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-800">3</p>
            <span className="text-xs text-red-500 font-medium">Action recommended</span>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
