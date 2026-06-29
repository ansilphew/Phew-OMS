import {
  BadgeDollarSign,
  BriefcaseBusiness,
  FolderKanban,
  HandCoins,
  Headset,
  LayoutDashboard,
  ReceiptText,
  Settings,
  Target,
  Users,
  UserSquare2,
  FileText,
} from "lucide-react";

export const sidebarMenus = {
  ceo: [
    { label: "Dashboard", href: "/ceo", icon: LayoutDashboard },
    { label: "Lead Management", href: "/ceo/lead-management", icon: Target },
    { label: "Proposal Management", href: "/ceo/proposal-management", icon: FileText },
    { label: "Projects", href: "/ceo/projects", icon: FolderKanban },
    { label: "Accounts & Payments", href: "/ceo/accounts", icon: BadgeDollarSign },
    { label: "User Registration", href: "/register", icon: Users },
  ],
  bde: [
    { label: "Lead Management", href: "/ceo/lead-management", icon: Target },
    { label: "Proposal Management", href: "/ceo/proposal-management", icon: FileText },
  ],
  accountant: [
    { label: "Proposal Management", href: "/ceo/proposal-management", icon: FileText },
    { label: "Accounts & Payments", href: "/ceo/accounts", icon: BadgeDollarSign },
  ],
  projectManager: [
    { label: "Dashboard", href: "/project-manager", icon: LayoutDashboard },
    { label: "Projects", href: "/ceo/projects", icon: FolderKanban },
    { label: "User Registration", href: "/register", icon: Users },
  ],
  client: [
    { label: "Dashboard", href: "/client", icon: LayoutDashboard },
  ],
  salesHead: [
    { label: "Lead Management", href: "/ceo/lead-management", icon: Target },
    { label: "Proposal Management", href: "/ceo/proposal-management", icon: FileText },
  ],
};

export const sidebarBottomMenus = [];

export function getSidebarMenuByPath(pathname = "", userRole = "") {
  if (userRole) {
    const roleKey = 
      userRole === "Project Manager" ? "projectManager" : 
      userRole === "Sales Head" ? "salesHead" : 
      userRole.toLowerCase();
    if (sidebarMenus[roleKey]) {
      return sidebarMenus[roleKey];
    }
  }

  if (pathname.startsWith("/ceo")) {
    return sidebarMenus.ceo;
  }

  if (pathname.startsWith("/bde")) {
    return sidebarMenus.bde;
  }

  if (pathname.startsWith("/accountant")) {
    return sidebarMenus.accountant;
  }

  if (pathname.startsWith("/project-manager")) {
    return sidebarMenus.projectManager;
  }

  if (pathname.startsWith("/client")) {
    return sidebarMenus.client;
  }

  return [];
}
