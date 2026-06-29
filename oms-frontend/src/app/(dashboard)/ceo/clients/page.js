"use client";

import ProtectedPage from "@/components/auth/ProtectedPage";
import { Users, Shield, ArrowRight } from "lucide-react";

export default function CEOClientsPage() {
  return (
    <ProtectedPage allowedRole="CEO">
      <div className="space-y-6 pb-16">
        <div>
          <h2 className="text-[20px] font-bold text-[#1f1f1f]">Client Portal</h2>
          <p className="text-[13.5px] text-[#9a9a9a]">Manage client business relationships and project gateways.</p>
        </div>

        <div className="w-full rounded-2xl border border-[#e2e8f0] bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f3f4f6] text-slate-400 mb-4">
            <Users className="h-6 w-6 text-slate-500" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">Central Client Registry</h3>
          <p className="text-[13.5px] text-slate-500 max-w-md mx-auto mb-6">
            Review active corporate accounts, profile security configurations, and historical project logs.
          </p>

          <div className="mt-8 border-t border-[#f1f5f9] pt-6 max-w-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-left">
              <Shield className="h-4.5 w-4.5 text-[#3b0d58] mb-2" />
              <h4 className="text-[13px] font-bold text-slate-800 mb-0.5">Secure Gateways</h4>
              <p className="text-[11.5px] text-slate-400">Configure single sign-on security filters for client profiles.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-left">
              <Users className="h-4.5 w-4.5 text-[#3b0d58] mb-2" />
              <h4 className="text-[13px] font-bold text-slate-800 mb-0.5">Account Profiles</h4>
              <p className="text-[11.5px] text-slate-400">Track company contacts, designations, and billing contacts.</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
