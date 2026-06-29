"use client";

import React from "react";
import {
  Megaphone,
  CheckCircle,
  Rocket,
  CreditCard,
  AlertCircle,
  CheckCheck,
  SlidersHorizontal,
} from "lucide-react";

const CATEGORY_META = {
  leads: {
    icon: Megaphone,
    iconBg: "bg-[#edf5ff]",
    iconColor: "text-[#3b82f6]",
    tagLabel: "LEAD MANAGEMENT",
    tagBg: "bg-slate-100",
    tagText: "text-slate-600",
  },
  proposals: {
    icon: CheckCircle,
    iconBg: "bg-[#eefcf3]",
    iconColor: "text-[#10b981]",
    tagLabel: "PROPOSALS",
    tagBg: "bg-slate-100",
    tagText: "text-slate-600",
  },
  projects: {
    icon: Rocket,
    iconBg: "bg-[#fff8eb]",
    iconColor: "text-[#f59e0b]",
    tagLabel: "MILESTONES",
    tagBg: "bg-slate-100",
    tagText: "text-slate-600",
  },
  payments: {
    icon: CreditCard,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    tagLabel: "FINANCE",
    tagBg: "bg-slate-100",
    tagText: "text-slate-600",
  },
  system: {
    icon: AlertCircle,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    tagLabel: "SYSTEM",
    tagBg: "bg-red-50",
    tagText: "text-red-600 font-semibold",
  },
};

const SEVERITY_META = {
  normal: { label: "INFO", bg: "bg-slate-100", text: "text-slate-500" },
  high: { label: "HIGH PRIORITY", bg: "bg-blue-50", text: "text-blue-600 font-semibold" },
  critical: { label: "CRITICAL", bg: "bg-red-50", text: "text-red-600 font-semibold" },
};

function formatTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  
  // Guard against slight clock skew
  if (diffMs < 0) return "just now";
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function NotificationList({
  activeTab = "all",
  notifications = [],
  onMarkAllAsRead,
  onMarkSingleAsRead,
}) {
  
  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === "all") return true;
    return notif.category === activeTab;
  });

  return (
    <div className="w-full">
      
      {/* Feed Header */}
      <div className="sticky top-[88px] pt-6 bg-[#f5f5f7] z-10 pb-3.5 mb-4.5 flex items-center justify-between border-b border-[#e5e7eb]">
        <h2 className="text-base font-bold text-slate-800">Recent Notifications</h2>
        
        <div className="flex items-center gap-4">
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-500 hover:text-[#65008c] transition-colors cursor-pointer outline-none"
          >
            <CheckCheck className="h-4.5 w-4.5" />
            Mark all as read
          </button>
          
          <button className="flex h-7 w-7 items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer rounded-[5px] outline-none">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Notifications Items List */}
      {filteredNotifications.length === 0 ? (
        <div className="border border-[#e5e7eb] bg-white p-12 text-center text-[13.5px] text-slate-400 rounded-[5px] shadow-2xs">
          No notifications found in this category.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notif) => {
            const meta = CATEGORY_META[notif.category] || CATEGORY_META.system;
            const severityMeta = SEVERITY_META[notif.severity] || SEVERITY_META.normal;
            const Icon = meta.icon;

            return (
              <div
                key={notif.id}
                onClick={() => notif.unread && onMarkSingleAsRead && onMarkSingleAsRead(notif.id)}
                className={`flex items-start justify-between border border-[#e5e7eb] bg-white p-5 rounded-[5px] shadow-2xs hover:shadow-xs transition-shadow duration-200 ${
                  notif.unread ? "border-l-4 border-l-[#3b82f6] cursor-pointer" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[5px] ${meta.iconBg}`}
                  >
                    <Icon className={`h-5.5 w-5.5 ${meta.iconColor}`} />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h3 className="text-[15px] font-bold text-slate-800">
                      {notif.title}
                    </h3>
                    <p className="text-[13px] leading-relaxed text-slate-500 max-w-xl">
                      {notif.body}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {/* Main Category Tag */}
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-[5px] tracking-wider ${meta.tagBg} ${meta.tagText}`}
                      >
                        {meta.tagLabel}
                      </span>
                      
                      {/* Severity/Status Tag */}
                      {notif.category === "payments" ? (
                        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-[5px] tracking-wider bg-slate-100 text-slate-600 font-semibold">
                          PAID
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-[5px] tracking-wider ${severityMeta.bg} ${severityMeta.text}`}
                        >
                          {severityMeta.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2.5 shrink-0 pl-4">
                  <span className="text-[11.5px] font-medium text-slate-400">
                    {formatTime(notif.time)}
                  </span>
                  {notif.unread && (
                    <span className="h-2 w-2 bg-[#3b82f6] rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
