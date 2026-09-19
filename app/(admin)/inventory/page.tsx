import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SearchFilterBar from "./search-filter-bar";
import UnitActions from "./unit-actions";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    IN_STOCK: "bg-teal-50 text-teal-700",
    SOLD: "bg-brand-50 text-brand-700",
    REPAIR: "bg-amber-50 text-amber-700",
    SHIPPED: "bg-ink-400/15 text-ink-800",
  };

  const labels: Record<string, string> = {
    IN_STOCK: "In Stock",
    SOLD: "Sold",
    REPAIR: "Repair",
    SHIPPED: "Shipped",
  };

  return (
    <span
      className={`inline-block rounded-md px-2.5 py-1 text-xs font-medium ${styles[status] ?? "bg-ink-400/10 text-ink-600"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

function formatPrice(value: unknown) {
  const num = Number(value);
  return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const statusFilter = params.status;

  const words = query.split(/\s+/).filter(Boolean);

  const searchConditions = words.map((word) => ({
    OR: [
      { imei: { contains: word } },
      { serialNumber: { contains: word } },
      { product: { contains: word } },
      { model: { contains: word } },
      { storage: { contains: word } },
      { color: { contains: word } },
    ],
  }));

  const units = await prisma.inventoryUnit.findMany({
    where: {
      AND: [
        statusFilter && statusFilter !== "ALL"
          ? { status: statusFilter as "IN_STOCK" | "SOLD" | "REPAIR" | "SHIPPED" }
          : {},
        ...searchConditions,
      ],
    },
    include: { currentBranch: true },
    orderBy: { dateAdded: "desc" },
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-950">Inventory</h1>
          <p className="mt-1 text-sm text-ink-600">
            {units.length} unit{units.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/inventory/add"
          className="inline-block rounded-md bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-700"
        >
          + Add Unit
        </Link>
      </div>

      <SearchFilterBar />

      <div className="mt-4 overflow-x-auto rounded-lg bg-card shadow-sm ring-1 ring-ink-400/15">
        <table className="min-w-full divide-y divide-ink-400/15 text-sm">
          <thead className="bg-surface">
            <tr>
              {["IMEI", "Product", "Model", "Storage", "Color", "Purchase Price", "Status", "Branch", "Date Added", "Actions"].map(
                (header) => (
                  <th key={header} className="px-4 py-3 text-left font-medium text-ink-600">
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-400/10">
            {units.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-ink-400">
                  {query || (statusFilter && statusFilter !== "ALL")
                    ? "No units match your search or filter."
                    : 'No units yet. Click "Add Unit" to get started.'}
                </td>
              </tr>
            ) : (
              units.map((unit) => (
                <tr key={unit.id} className="hover:bg-surface">
                  <td className="px-4 py-3 text-ink-800">{unit.imei ?? "—"}</td>
                  <td className="px-4 py-3 font-medium text-ink-950">{unit.product}</td>
                  <td className="px-4 py-3 text-ink-800">{unit.model}</td>
                  <td className="px-4 py-3 text-ink-800">{unit.storage || "—"}</td>
                  <td className="px-4 py-3 text-ink-800">{unit.color || "—"}</td>
                  <td className="px-4 py-3 text-ink-800">{formatPrice(unit.purchasePrice)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={unit.status} />
                  </td>
                  <td className="px-4 py-3 text-ink-800">{unit.currentBranch.name}</td>
                  <td className="px-4 py-3 text-ink-800">{formatDate(unit.dateAdded)}</td>
                  <td className="px-4 py-3">
                    <UnitActions id={unit.id} status={unit.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}