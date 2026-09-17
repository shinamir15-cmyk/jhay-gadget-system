import Link from "next/link";
import LogoutButton from "./logout-button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gray-900 text-white">
        <div className="border-b border-gray-800 px-6 py-5">
          <h1 className="text-lg font-semibold">Jhay Gadjet Store</h1>
          <p className="text-xs text-gray-400">Inventory System</p>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          <Link
            href="/dashboard"
            className="rounded px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Dashboard
          </Link>
          <Link
            href="/inventory"
            className="rounded px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Inventory
          </Link>
          <Link
            href="/inventory/add"
            className="rounded px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Add Unit
          </Link>
        </nav>

        <div className="mt-auto p-4">
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <span className="text-sm text-gray-500">Admin Panel</span>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}