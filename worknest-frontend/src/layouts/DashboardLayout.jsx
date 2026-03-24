import { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "@/components/dashboard/Sidebar";
import AdminTopBar from "@/components/dashboard/AdminTopBar";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen relative">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay(mobile only) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Right section */}
      <div className="flex-1 flex flex-col lg:ml-64">
        <AdminTopBar onMenuClick={() => setSidebarOpen(true)} />
        {/* main content area */}
        <main className="flex-1 bg-[#F4F4F4] p-6">
          {/* <header className="h-16 bg- border-b border-gray-200 flex items-center px-8">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            Admin Panel
          </h2>
        </header> */}
          <div className="p-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
