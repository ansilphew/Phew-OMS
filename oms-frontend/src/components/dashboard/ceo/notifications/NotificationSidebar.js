"use client";

import React from "react";
import { Inbox, Users, FileCheck, Rocket, CreditCard, AlertCircle } from "lucide-react";

export default function NotificationSidebar({ activeTab = "all", onTabChange, notifications = [] }) {
  const unreadCount = notifications.filter((n) => n.unread).length;

  const menuItems = [
    { id: "all", label: "All Notifications", icon: Inbox, count: unreadCount },
    { id: "leads", label: "Lead Activities", icon: Users },
    { id: "proposals", label: "Proposal Updates", icon: FileCheck },
    { id: "projects", label: "Project Updates", icon: Rocket },
    { id: "payments", label: "Payment Alerts", icon: CreditCard },
    { id: "system", label: "System Alerts", icon: AlertCircle, color: "text-[#ef4444] hover:text-[#dc2626]" },
  ];

  return (
    <div className="w-full border border-[#e5e7eb] bg-white p-4 rounded-[5px] shadow-xs">
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isSystem = item.id === "system";

          return (
            <button
              key={item.id}
              onClick={() => onTabChange && onTabChange(item.id)}
              className={`flex w-full items-center justify-between px-3.5 py-3 text-left text-[13.5px] font-medium transition-colors cursor-pointer rounded-[5px] ${
                isActive
                  ? "bg-[#f3f4f6] text-slate-800"
                  : isSystem
                  ? "text-[#ef4444] hover:bg-red-50/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4.5 w-4.5 shrink-0 ${
                    isActive
                      ? isSystem
                        ? "text-[#ef4444]"
                        : "text-slate-700"
                      : isSystem
                      ? "text-[#ef4444]"
                      : "text-slate-400"
                  }`}
                  strokeWidth={2}
                />
                <span>{item.label}</span>
              </div>

              {item.count !== undefined && (
                <span
                  className={`inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-semibold rounded-[5px] ${
                    isActive ? "bg-white text-slate-800" : "bg-[#f1f3f5] text-slate-500"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
