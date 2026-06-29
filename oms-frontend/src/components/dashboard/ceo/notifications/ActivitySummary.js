"use client";

import React from "react";

export default function ActivitySummary({ notifications = [] }) {
  // Count real notification entities for each category
  const leadsCount = notifications.filter((n) => n.category === "leads").length;
  const proposalsCount = notifications.filter((n) => n.category === "proposals").length;
  const projectsCount = notifications.filter((n) => n.category === "projects").length;
  const paymentsCount = notifications.filter((n) => n.category === "payments").length;

  const activities = [
    { label: "Leads Added", count: String(leadsCount).padStart(2, "0"), dotColor: "bg-[#3b82f6]" },
    { label: "Proposals Approved", count: String(proposalsCount).padStart(2, "0"), dotColor: "bg-[#10b981]" },
    { label: "Projects Updated", count: String(projectsCount).padStart(2, "0"), dotColor: "bg-[#f59e0b]" },
    { label: "Payments Received", count: String(paymentsCount).padStart(2, "0"), dotColor: "bg-[#3b0d58]" },
  ];

  return (
    <div className="border border-[#e5e7eb] bg-white p-5 rounded-[5px] shadow-xs">
      <div>
        <h3 className="text-[14px] font-bold text-slate-800">Today's Activity Summary</h3>
        <p className="mt-0.5 text-[11px] text-slate-400">Summary of team movements today</p>
      </div>

      <div className="mt-6 space-y-4">
        {activities.map((act, index) => (
          <div key={index} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2.5">
              <span className={`h-2 w-2 rounded-full ${act.dotColor}`} />
              <span className="text-[13px] font-medium text-slate-600">
                {act.label}
              </span>
            </div>
            <span className="text-[13.5px] font-bold text-slate-800">
              {act.count}
            </span>
          </div>
        ))}
      </div>

      <button
        className="mt-6 block w-full bg-[#3b0d58] py-2.5 text-center text-[12.5px] font-semibold text-white transition-colors hover:bg-[#2c0a42] rounded-[5px] cursor-pointer outline-none"
        onClick={() => console.log("Viewing full report")}
      >
        View Full Report
      </button>
    </div>
  );
}
