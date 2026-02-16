"use client";

import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-zinc-50">
      {/* Sidebar */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Right side (header + content) */}
      <div className="flex-1 flex flex-col">
        {/* Mobile / Tablet Header */}
        <header className="lg:hidden sticky top-0 z-30 border-b bg-white">
          <div className="flex items-center gap-3 px-4 h-14">
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border bg-white"
              aria-label="Open sidebar"
            >
              ☰
            </button>
            <div className="text-lg font-semibold">Admin</div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
