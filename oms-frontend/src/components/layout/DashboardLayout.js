import Sidebar from "@/components/layout/Sidebar";
import DashboardTopbar from "@/components/layout/DashboardTopbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-light">
      <Sidebar />

      <div className="pl-60 pt-[88px]">
        <DashboardTopbar />
        <main className="px-6 py-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
