"use client";
 
import React from "react";
import { useRouter } from "next/navigation";
import { Globe, FileCheck, MessageSquare, ArrowRight } from "lucide-react";
 
const typeStyles = {
  project: {
    icon: Globe,
    accentColor: "border-l-[#4080ff]",
    iconBg: "bg-[#edf5ff]",
    iconColor: "text-[#3b82f6]",
  },
  proposal: {
    icon: FileCheck,
    accentColor: "border-l-[#10b981]",
    iconBg: "bg-[#eefcf3]",
    iconColor: "text-[#10b981]",
  },
  lead: {
    icon: MessageSquare,
    accentColor: "border-l-[#8b5cf6]",
    iconBg: "bg-[#f3f0ff]",
    iconColor: "text-[#8b5cf6]",
  },
};
 
export default function RecentWinningList({ items }) {
  const router = useRouter();

  // Show up to 4 items in the dashboard preview
  const displayWins =
    items && items.length > 0
      ? items.slice(0, 4).map((item) => {
          const style = typeStyles[item.type] || typeStyles.project;
          return {
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            time: item.time,
            icon: style.icon,
            accentColor: style.accentColor,
            iconBg: style.iconBg,
            iconColor: style.iconColor,
          };
        })
      : [];

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Recent Winning</h2>
        <button
          onClick={() => router.push("/ceo/recent-winnings")}
          className="flex items-center gap-1 text-[13px] font-semibold text-primary-button hover:text-[#3d0057] transition-colors cursor-pointer"
        >
          View all <ArrowRight className="h-4 w-4" />
        </button>
      </div>
 
      <div className="space-y-4">
        {displayWins.length === 0 ? (
          <div className="rounded-[5px] border border-dashed border-[#e5e7eb] p-8 text-center text-[13px] text-slate-400">
            No recent winnings yet. Close a lead or complete a project to see it here.
          </div>
        ) : (
          displayWins.map((win) => {
            const Icon = win.icon;
            return (
              <div
                key={win.id}
                className={`flex items-center justify-between rounded-[5px] border border-y-[#e5e7eb] border-r-[#e5e7eb] bg-white p-4 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm border-l-[3.5px] ${win.accentColor}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-[5px] ${win.iconBg}`}
                  >
                    <Icon className={`h-5 w-5 ${win.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-slate-800">{win.title}</h3>
                    <p className="mt-0.5 text-[12px] text-slate-500">{win.subtitle}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11.5px] font-medium text-slate-400">{win.time}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
