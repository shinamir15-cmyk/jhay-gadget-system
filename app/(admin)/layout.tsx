"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import LogoutButton from "./logout-button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/inventory", label: "Inventory" },
  { href: "/inventory/add", label: "Add Unit" },
  { href: "/branches", label: "Branches" },
  { href: "/shipments", label: "Shipments" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-surface">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink-950/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex-shrink-0 transform bg-ink-950 text-white transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-6 py-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-sm font-semibold">
            G
          </span>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Gadget Store</h1>
            <p className="text-xs text-ink-400">Inventory System</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-600 text-white"
                    : "text-ink-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-white/10 p-4">
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center justify-between border-b border-ink-400/20 bg-card px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-ink-600 hover:bg-surface lg:hidden"
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="text-sm text-ink-600">Admin Panel</span>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}