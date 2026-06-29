"use client";

import React from "react";

export default function MetricCard({
  title,
  value,
  subtext,
  subtextClass = "text-slate-500",
  icon: IconComponent,
  bgColor,
  iconBgColor,
  iconColor,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-[5px] p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${onClick ? "cursor-pointer" : ""} ${bgColor}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[13px] font-medium text-slate-500">
            {title}
          </span>
          <p className="mt-2 text-[28px] font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        
        {IconComponent && (
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-[5px] ${iconBgColor}`}
          >
            <IconComponent className={`h-5 w-5 ${iconColor}`} />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        <span className={`text-[12px] font-medium ${subtextClass}`}>
          {subtext}
        </span>
      </div>
    </div>
  );
}
