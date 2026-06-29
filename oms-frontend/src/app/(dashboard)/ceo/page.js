"use client";
 
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedPage from "@/components/auth/ProtectedPage";
import { getCurrentUser } from "@/lib/api";
import { CheckCircle, Rocket, Wallet, AlertTriangle, Trophy, Loader2 } from "lucide-react";
import axiosInstance from "@/api/axiosInstance";

import MetricCard from "@/components/dashboard/ceo/MetricCard";
import RecentWinningList from "@/components/dashboard/ceo/RecentWinningList";
import RevenueCard from "@/components/dashboard/ceo/RevenueCard";
 
export default function CeoPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    let isMounted = true;
    async function loadUserAndStats() {
      try {
        setLoading(true);
        const userData = await getCurrentUser();
        if (isMounted) {
          setUser(userData.user);
        }
        
        // Fetch dynamic CEO dashboard statistics from backend
        // Data sources (pipeline):
        //   - Closed Deals   → Lead.status="Close" + Proposal.status="Approved"
        //   - Active Projects → Project (not Completed)
        //   - Pending Payments→ Payment.balanceAmount
        //   - Delayed Projects→ Project.currentStatus="Delayed"
        //   - Recent Winning  → Lead "Close" + Proposal "Approved" in last 7 days
        const statsRes = await axiosInstance.get("/dashboard/ceo-stats");
        if (statsRes.data && statsRes.data.success && isMounted) {
          setStats(statsRes.data.stats);
        }
      } catch (err) {
        console.error("Error loading CEO dashboard data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadUserAndStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatCurrency = (val) => {
    if (typeof val !== "number" || isNaN(val)) return "₹0";
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  // Show a skeleton/loading state while data loads
  if (loading) {
    return (
      <ProtectedPage allowedRole="CEO">
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mr-3" />
          <span className="text-sm font-medium">Loading dashboard data…</span>
        </div>
      </ProtectedPage>
    );
  }
 
  return (
    <ProtectedPage allowedRole="CEO">
      <div className="space-y-8 pb-16">
        {/* Metrics Grid - 5 Columns */}
        {/* Each card navigates to its corresponding data source section */}
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {/* Card 1: Closed Deals → Lead Management (Close stage) */}
          <MetricCard
            title="Closed Deals"
            value={stats ? String(stats.closedDeals.value) : "0"}
            subtext={stats ? stats.closedDeals.subtext : "0 Deals this month"}
            icon={CheckCircle}
            bgColor="bg-[#f3f0ff]"
            iconBgColor="bg-[#e8e2ff]"
            iconColor="text-[#65008c]"
            onClick={() => router.push("/ceo/closed-deals")}
          />
 
          {/* Card 2: Active Projects → Projects page */}
          <MetricCard
            title="Active Projects"
            value={stats ? String(stats.activeProjects.value) : "0"}
            subtext={stats ? stats.activeProjects.subtext : "0 on track, 0 delayed"}
            icon={Rocket}
            bgColor="bg-[#edf5ff]"
            iconBgColor="bg-[#dbe9ff]"
            iconColor="text-[#3b82f6]"
            onClick={() => router.push("/ceo/projects")}
          />
 
          {/* Card 3: Pending Payments → Accounts page */}
          <MetricCard
            title="Pending Payments"
            value={stats ? formatCurrency(stats.pendingPayments.value) : "₹0"}
            subtext={stats ? `${formatCurrency(stats.pendingPayments.overdue)} overdue` : "₹0 overdue"}
            icon={Wallet}
            bgColor="bg-[#fff8eb]"
            iconBgColor="bg-[#ffeec2]"
            iconColor="text-[#f59e0b]"
            onClick={() => router.push("/ceo/accounts")}
          />
 
          {/* Card 4: Delayed Projects → Projects page filtered to Delayed */}
          <MetricCard
            title="Delayed Projects"
            value={stats ? String(stats.delayedProjects.value) : "0"}
            subtext={
              stats ? (
                <span className="flex items-center gap-1 text-[#ef4444] font-semibold">
                  {stats.delayedProjects.value} critical <span className="text-[10px]">▲</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[#ef4444] font-semibold">
                  0 critical <span className="text-[10px]">▲</span>
                </span>
              )
            }
            subtextClass="text-[#ef4444]"
            icon={AlertTriangle}
            bgColor="bg-[#fff0f1]"
            iconBgColor="bg-[#ffd6d9]"
            iconColor="text-[#ef4444]"
            onClick={() => router.push("/ceo/projects?status=delayed")}
          />
 
          {/* Card 5: Recent Winning → Lead Management */}
          <MetricCard
            title="Recent Winning"
            value={stats ? String(stats.recentWinningCount.value) : "0"}
            subtext={stats ? stats.recentWinningCount.subtext : "0 new wins this week"}
            icon={Trophy}
            bgColor="bg-[#eefcf3]"
            iconBgColor="bg-[#d1fae5]"
            iconColor="text-[#10b981]"
            onClick={() => router.push("/ceo/lead-management")}
          />
        </div>
 
        {/* Two-Column Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column (spans 2) - Recent Winning list */}
          <div className="lg:col-span-2">
            <RecentWinningList items={stats?.recentWinnings} />
          </div>
 
          {/* Right Column - Total Revenue */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <RevenueCard revenue={stats?.totalRevenue} growthPercent={stats?.revenueGrowthPercent} />
          </div>
        </div>
 
      </div>
    </ProtectedPage>
  );
}
