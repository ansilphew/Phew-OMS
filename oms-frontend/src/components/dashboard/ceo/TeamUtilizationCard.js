"use client";
 
import React from "react";
import { Users } from "lucide-react";
 
export default function TeamUtilizationCard({ design = 92, dev = 78 }) {
  return (
    <div className="rounded-[5px] border border-card-stroke bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-card-stroke pb-3">
        <h3 className="text-[14px] font-semibold text-primary-text">Team Utilization</h3>
        <Users className="h-5 w-5 text-light-medium" />
      </div>
 
      <div className="mt-5 space-y-5">
        {/* Design Team */}
        <div>
          <div className="flex items-center justify-between text-[12.5px] font-medium text-secondary-text">
            <span>Design Team</span>
            <span className="font-semibold">{design}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-[5px] bg-menu-fill">
            <div
              className="h-1.5 rounded-[5px] bg-primary-button"
              style={{ width: `${design}%` }}
            />
          </div>
        </div>
 
        {/* Dev Team */}
        <div>
          <div className="flex items-center justify-between text-[12.5px] font-medium text-secondary-text">
            <span>Dev Team</span>
            <span className="font-semibold">{dev}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-[5px] bg-menu-fill">
            <div
              className="h-1.5 rounded-[5px] bg-light-medium"
              style={{ width: `${dev}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
