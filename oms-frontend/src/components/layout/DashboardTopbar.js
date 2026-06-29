"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api";
import axiosInstance from "@/api/axiosInstance";

const dashboardMeta = {
  "/ceo": {
    title: "CEO Dashboard",
    description: "Company overview and performance snapshot",
  },
  "/ceo/lead-management": {
    title: "Lead Management",
    description: "Company leads, pipeline stages, and conversion tracking",
  },
  "/ceo/proposal-management": {
    title: "Proposal Management",
    description: "Track customer proposals, contract approvals, and proposals",
  },
  "/ceo/projects": {
    title: "List Of Projects",
    description: "Track and manage all active and completed projects",
  },
  "/ceo/accounts": {
    title: "Accounts and Payments",
    description: "Track project payments, balances and financial records",
  },
  "/bde": {
    title: "BDE Dashboard",
    description: "Sales pipeline, leads, and conversion updates",
  },
  "/bde/leads": {
    title: "BDE Leads",
    description: "Add and track your prospective sales leads",
  },
  "/bde/clients": {
    title: "BDE Clients",
    description: "List and manage your registered business clients",
  },
  "/bde/proposal-management": {
    title: "BDE Proposals",
    description: "View and edit draft proposals submitted to prospective clients",
  },
  "/accountant": {
    title: "Accountant Dashboard",
    description: "Overview of invoice collection records and tax ledger stats",
  },
  "/accountant/invoices": {
    title: "Invoices Ledger",
    description: "Create, view and manage billing invoice receipts",
  },
  "/accountant/payments": {
    title: "Payments Collections",
    description: "Log and audit collection payment checks",
  },
  "/project-manager": {
    title: "Project Manager Workspace",
    description: "Overview of your assigned production schedules, teams and milestones",
  },
  "/project-manager/projects": {
    title: "Milestone Deliverables",
    description: "Manage project tasks checklist and track execution state",
  },
  "/project-manager/teams": {
    title: "Production Teams",
    description: "Track work allocations and resource capacities",
  },
  "/client": {
    title: "Client Desk",
    description: "Milestones review, assets deliveries and transaction logs",
  },
  "/profile": {
    title: "My Profile",
    description: "View and update your personal and professional details",
  },
  "/settings": {
    title: "Settings",
    description: "Configure your application preferences and security details",
  },
  "/support": {
    title: "Help & Support",
    description: "Get assistance and coordinate with the support desk",
  },
  "/ceo/notifications": {
    title: "Notifications",
    description: "Track system updates, project activities, and team actions",
  },
};

export default function DashboardTopbar() {
  const pathname = usePathname();
  const currentMeta = dashboardMeta[pathname] || {
    title: "Dashboard",
    description: "OMS Portal Section",
  };
  const [dynamicTitle, setDynamicTitle] = useState("");
  const [dynamicDesc, setDynamicDesc] = useState("");
  const [profileName, setProfileName] = useState("Profile");
  const [profileRole, setProfileRole] = useState("");
  const [hasUnread, setHasUnread] = useState(false);

  // Search lead states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const checkSessionTitle = () => {
      if (typeof window !== "undefined") {
        const storedTitle = sessionStorage.getItem("project_active_title");
        const storedDesc = sessionStorage.getItem("project_active_desc");
        if (storedTitle) {
          setDynamicTitle(storedTitle);
          setDynamicDesc(storedDesc || "");
          return;
        }
      }
      setDynamicTitle("List Of Projects");
      setDynamicDesc("Track and manage all active and completed projects");
    };

    if (pathname === "/ceo/projects") {
      checkSessionTitle();
    } else {
      setDynamicTitle("");
      setDynamicDesc("");
    }

    const handleTabChange = (e) => {
      if (pathname === "/ceo/projects") {
        if (e.detail && e.detail.title) {
          setDynamicTitle(e.detail.title);
          setDynamicDesc(e.detail.description || "");
          if (typeof window !== "undefined") {
            sessionStorage.setItem("project_active_title", e.detail.title);
            sessionStorage.setItem("project_active_desc", e.detail.description || "");
          }
        }
      } else {
        setDynamicTitle("List Of Projects");
        setDynamicDesc("Track and manage all active and completed projects");
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("project_active_title");
          sessionStorage.removeItem("project_active_desc");
        }
      }
    };

    window.addEventListener("projectTabChange", handleTabChange);
    return () => {
      window.removeEventListener("projectTabChange", handleTabChange);
    };
  }, [pathname]);

  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const data = await getCurrentUser();
        const fullName = data?.user?.fullName?.trim();
        const role = data?.user?.role;

        if (isMounted) {
          if (fullName) setProfileName(fullName);
          if (role) setProfileRole(role);
        }
      } catch (error) {
        if (isMounted) {
          setProfileName("Profile");
          setProfileRole("");
        }
      }
    }

    async function checkUnread() {
      try {
        const res = await axiosInstance.get("/notifications");
        const list = res.data.notifications || [];
        const unreadExists = list.some((n) => n.unread);
        if (isMounted) {
          setHasUnread(unreadExists);
        }
      } catch {
        // silent fail
      }
    }

    loadProfile();
    checkUnread();

    const interval = setInterval(checkUnread, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      try {
        const res = await axiosInstance.get(`/leads?search=${encodeURIComponent(val)}`);
        setSearchResults(res.data.leads || []);
        setShowDropdown(true);
      } catch (err) {
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
    }, 250);
  };

  const handleSelectLead = (leadId) => {
    setShowDropdown(false);
    setSearchQuery("");
    router.push(`/lead-details/${leadId}`);
  };

  return (
    <header className="fixed left-60 right-0 top-0 z-20 border-b border-card-stroke bg-white shadow-sm">
      <div className="flex min-h-[88px] items-center justify-between px-7 py-3">
        <div>
          <h1 className="app-heading-title">
            {dynamicTitle || currentMeta.title}
          </h1>

          <p className="app-body-muted">
            {dynamicDesc || currentMeta.description}
          </p>
        </div>

        <div className="flex items-center gap-6">
          {pathname !== "/client" && (
            <div className="relative">
              <div className="flex h-11 w-62.5 items-center rounded-xl border border-card-stroke bg-menu-fill px-4">
                <svg
                  className="h-5 w-5 text-secondary-text"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M21 21L16.65 16.65M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onBlur={handleBlur}
                  placeholder="Search leads..."
                  className="ml-3 w-full bg-transparent text-[14px] text-primary-text outline-none placeholder:text-search-text"
                />
              </div>

              {/* Search Dropdown Overlay */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-xl border border-card-stroke bg-white py-2 shadow-lg z-30">
                  {searchResults.map((lead) => (
                    <button
                      key={lead._id}
                      onClick={() => handleSelectLead(lead._id)}
                      className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition duration-150 flex flex-col gap-0.5 border-b last:border-b-0 border-slate-100"
                    >
                      <span className="text-[13px] font-semibold text-slate-700 block truncate">
                        {lead.projectName}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {lead.organization || "No Organization"} • {lead.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Empty/No Results Message */}
              {showDropdown && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                <div className="absolute left-0 right-0 mt-2 rounded-xl border border-card-stroke bg-white px-4 py-3 text-center text-[12px] text-slate-400 shadow-lg z-30">
                  No matching leads found
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => {
              if (pathname.startsWith("/ceo")) {
                router.push("/ceo/notifications");
              } else {
                router.push("/notifications");
              }
            }}
            className={`relative flex cursor-pointer items-center justify-center transition-colors duration-200 ${
              pathname === "/ceo/notifications" || pathname === "/notifications"
                ? "text-primary-button"
                : "text-secondary-text hover:text-primary-text"
            }`}
            aria-label="View notifications"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M14.8571 18H9.14286M17 8.57143C17 7.24721 16.4739 5.97786 15.5376 5.04156C14.6013 4.10525 13.3319 3.5791 12.0077 3.5791C10.6835 3.5791 9.41412 4.10525 8.47781 5.04156C7.54151 5.97786 7.01536 7.24721 7.01536 8.57143C7.01536 14.3974 4.57129 16.4286 4.57129 16.4286H19.4284C19.4284 16.4286 17 14.3974 17 8.57143Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {hasUnread && (
              <span className="absolute top-px right-0 h-1.75 w-1.75 rounded-full bg-[#d91c24]" />
            )}
          </button>

          <div className="h-6 w-px bg-card-stroke" />

          <button
            className="flex cursor-pointer items-center gap-3"
            onClick={() => router.push("/profile")}
            aria-label="Open profile"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-menu-fill shrink-0">
              <svg
                className="h-4.5 w-4.5 text-secondary-text"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M20 21C20 17.6863 16.4183 15 12 15C7.58172 15 4 17.6863 4 21M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex flex-col items-start justify-center text-left">
              <span className="text-[14px] font-semibold text-primary-text leading-tight">
                {profileName}
              </span>
              {profileRole && (
                <span className="text-[11.5px] text-secondary-text font-medium uppercase mt-0.5 tracking-wider leading-none">
                  {profileRole}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
