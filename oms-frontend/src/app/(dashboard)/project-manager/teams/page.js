"use client";

import ProtectedPage from "@/components/auth/ProtectedPage";

export default function PMTeamsPage() {
  return (
    <ProtectedPage allowedRole="Project Manager" title="Teams Directory">
      <div className="rounded-xl border border-[#eef0f3] bg-white p-8 mt-6">
        <h2 className="text-lg font-bold text-[#1f1f1f] mb-2">Development Teams</h2>
        <p className="text-sm text-[#9a9a9a]">Allocate developers, designers, and QA engineers to specific project assignments.</p>
        
        <div className="mt-8 border border-dashed border-[#e2e8f0] rounded-xl p-12 text-center text-slate-400">
          No team members registered under your department directory.
        </div>
      </div>
    </ProtectedPage>
  );
}
