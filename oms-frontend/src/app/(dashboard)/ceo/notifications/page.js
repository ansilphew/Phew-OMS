"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProtectedPage from "@/components/auth/ProtectedPage";
import NotificationSidebar from "@/components/dashboard/ceo/notifications/NotificationSidebar";
import NotificationList from "@/components/dashboard/ceo/notifications/NotificationList";
import ActivitySummary from "@/components/dashboard/ceo/notifications/ActivitySummary";
import { Loader2 } from "lucide-react";

export default function CeoNotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchNotifications = useCallback(async () => {
    try {
      setError("");
      const res = await fetch(`${API}/notifications`, { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch(`${API}/notifications/mark-read`, {
        method: "PUT",
        credentials: "include",
      });
      if (res.ok) {
        // Refresh notifications
        fetchNotifications();
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleMarkSingleAsRead = async (id) => {
    try {
      const res = await fetch(`${API}/notifications/${id}/read`, {
        method: "PUT",
        credentials: "include",
      });
      if (res.ok) {
        // Refresh notifications
        fetchNotifications();
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  return (
    <ProtectedPage allowedRole="CEO">
      <div className="space-y-8 pb-16">
        
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#3b0d58]" />
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center text-red-600">
            {error}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-4">
            
            {/* Left Column (Filters Menu) - spans 1 on desktop */}
            <div className="md:col-span-1">
              <div className="sticky top-[112px]">
                <NotificationSidebar
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  notifications={notifications}
                />
              </div>
            </div>

            {/* Center Column (Feed) - spans 2 on desktop */}
            <div className="md:col-span-2">
              <NotificationList
                activeTab={activeTab}
                notifications={notifications}
                onMarkAllAsRead={handleMarkAllAsRead}
                onMarkSingleAsRead={handleMarkSingleAsRead}
              />
            </div>

            {/* Right Column (Metrics Summary) - spans 1 on desktop */}
            <div className="md:col-span-1">
              <div className="sticky top-[112px]">
                <ActivitySummary notifications={notifications} />
              </div>
            </div>

          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
