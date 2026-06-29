"use client";

import ProtectedPage from "@/components/auth/ProtectedPage";

export default function PMProjectsPage() {
  return (
    <ProtectedPage allowedRole="Project Manager" title="Project Tracking">
      <div className="rounded-xl border border-[#eef0f3] bg-white p-8 mt-6">
        <h2 className="text-lg font-bold text-[#1f1f1f] mb-2">My Live Projects</h2>
        <p className="text-sm text-[#9a9a9a]">Manage your developmental sprints, log deployment task boards, and update execution phases.</p>
        
        <div className="mt-8 border border-dashed border-[#e2e8f0] rounded-xl p-12 text-center text-slate-400">
          No live projects allocated. Select "Assign Project" to allocate a development board.
        </div>
      </div>
    </ProtectedPage>
  );
}
