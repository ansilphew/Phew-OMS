"use client";
 
import React from "react";
 
export default function RevenueCard({ revenue, growthPercent }) {
  // Format the total revenue figure
  const formattedRevenue =
    typeof revenue === "number" && !isNaN(revenue)
      ? revenue >= 10000000
        ? `₹${(revenue / 10000000).toFixed(2)} Cr`
        : revenue >= 100000
        ? `₹${(revenue / 100000).toFixed(2)} L`
        : `₹${revenue.toLocaleString("en-IN")}`
      : "₹0";

  // Determine the growth badge
  // growthPercent is undefined → still loading, show nothing
  // growthPercent is 0 or null → no comparison baseline yet, show 0%
  const hasGrowthData = typeof growthPercent === "number";
  const isPositive = hasGrowthData && growthPercent > 0;
  const isNegative = hasGrowthData && growthPercent < 0;

  const badgeLabel = hasGrowthData
    ? growthPercent === 0
      ? "0%"
      : `${isPositive ? "+" : ""}${growthPercent}%`
    : null;

  return (
    <div className="relative overflow-hidden rounded-[5px] bg-primary-button p-6 text-white shadow-sm">
      {/* Decorative subtle background gradient shapes */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-[5px] bg-white/5 blur-lg" />
      <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-[5px] bg-white/5 blur-lg" />
 
      <div className="relative z-10">
        <h3 className="text-[15px] font-semibold text-white/95">Total Revenue</h3>
        <p className="mt-0.5 text-[12px] text-white/60">This month vs last month</p>
 
        <div className="mt-8 flex items-center justify-between gap-4">
          <span className="text-[32px] font-bold tracking-tight text-white">
            {formattedRevenue}
          </span>

          {/* Growth badge — only rendered once data is loaded */}
          {badgeLabel !== null && (
            <span
              className={`inline-flex items-center rounded-[5px] px-2.5 py-1 text-[12px] font-bold ${
                isNegative
                  ? "bg-red-100 text-red-600"
                  : isPositive
                  ? "bg-white text-primary-button"
                  : "bg-white/20 text-white"
              }`}
              title={
                growthPercent === 0
                  ? "No previous month data to compare yet"
                  : `${isPositive ? "Up" : "Down"} ${Math.abs(growthPercent)}% from last month`
              }
            >
              {badgeLabel}
            </span>
          )}
        </div>

        {/* Contextual note when there is no baseline */}
        {hasGrowthData && growthPercent === 0 && (
          <p className="mt-2 text-[11px] text-white/40">
            No previous month data to compare yet
          </p>
        )}
      </div>
    </div>
  );
}
