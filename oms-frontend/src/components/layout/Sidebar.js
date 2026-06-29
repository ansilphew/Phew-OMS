"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSidebarMenuByPath, sidebarBottomMenus, sidebarMenus } from "@/constants/sidebarMenus";
import { getCurrentUser, logoutUser } from "@/lib/api";
import { LogOut } from "lucide-react";

function SidebarMenuItem({ item, pathname }) {
  const Icon = item.icon;
  const isBaseDashboard = ["/ceo", "/bde", "/accountant", "/project-manager", "/client"].includes(item.href);
  const isActive = isBaseDashboard
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition duration-200 ${
        isActive
          ? "bg-menu-fill text-primary-text font-semibold"
          : "text-secondary-text hover:bg-menu-fill/50 hover:text-primary-text"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.9} />
      <span className="whitespace-nowrap">{item.label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
      router.push("/login");
    }
  };

  useEffect(() => {
    async function loadUserRole() {
      try {
        const data = await getCurrentUser();
        if (data?.user?.role) {
          setUserRole(data.user.role);
        }
      } catch (error) {
        console.error("Failed to load user role in sidebar:", error);
      }
    }
    loadUserRole();
  }, []);

  // Determine current menu based on pathname and userRole
  let currentMenu = getSidebarMenuByPath(pathname, userRole);

  // If on a shared route (like /profile, /settings, /support) and menu is empty, fallback to role-based menu
  if (currentMenu.length === 0 && userRole) {
    const roleKey = 
      userRole === "Project Manager" ? "projectManager" : 
      userRole === "Sales Head" ? "salesHead" : 
      userRole.toLowerCase();
    currentMenu = sidebarMenus[roleKey] || [];
  }

  const roleKeyForRedirect = 
    userRole === "Project Manager" ? "projectManager" : 
    userRole === "Sales Head" ? "salesHead" : 
    userRole?.toLowerCase();
  const userMenuForRedirect = sidebarMenus[roleKeyForRedirect] || [];
  const targetHref = userMenuForRedirect[0]?.href || "/";

  return (
    <aside className="fixed inset-y-0 left-0 flex h-screen w-60 flex-col border-r border-card-stroke bg-white">
      <div className="px-6 min-h-[89px] border-b border-card-stroke flex items-center">
        <Link href={targetHref} className="cursor-pointer w-full flex items-center justify-start">
          <img src="/images/phew-new-logo.svg" alt="Phew Logo" className="cursor-pointer max-w-[140px]  w-full h-auto" />
        </Link>
      </div> 

      <div className="flex flex-1 flex-col justify-between overflow-y-auto px-4 pb-5">
        <nav className="space-y-1.5 mt-6">
          {currentMenu.map((item) => (
            <SidebarMenuItem key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>

        <div className="space-y-1.5 pt-6">
          {sidebarBottomMenus.map((item) => (
            <SidebarMenuItem key={item.href} item={item} pathname={pathname} />
          ))}

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition duration-200 cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.9} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
