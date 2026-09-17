import { prisma } from "@/lib/prisma";
import Link from "next/link";
import UnitActions from "./unit-actions";
import SearchFilterBar from "./search-filter-bar";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    IN_STOCK: "bg-green-100 text-green-700",
    SOLD: "bg-blue-100 text-blue-700",
    REPAIR: "bg-amber-100 text-amber-700",
  };

  const labels: Record<string, string> = {
    IN_STOCK: "IN STOCK",
    SOLD: "SOLD",
    REPAIR: "REPAIR",
  };

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] ?? "bg-gray-100 text-gray-700"}`}
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
        ? { status: statusFilter as "IN_STOCK" | "SOLD" | "REPAIR" }
        : {},
      ...searchConditions,
    ],
  },
  orderBy: { dateAdded: "desc" },
});

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Inventory</h1>
          <p className="mt-1 text-sm text-gray-500">
            {units.length} unit{units.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/inventory/add"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Unit
        </Link>
      </div>

    <SearchFilterBar />

      <div className="mt-4 overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["IMEI", "Product", "Model", "Storage", "Color", "Purchase Price", "Status", "Date Added", "Actions"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left font-medium text-gray-500"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {units.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                  No units yet. Click "Add Unit" to get started.
                </td>
              </tr>
            ) : (
              units.map((unit) => (
                <tr key={unit.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{unit.imei ?? "—"}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{unit.product}</td>
                  <td className="px-4 py-3 text-gray-700">{unit.model}</td>
                  <td className="px-4 py-3 text-gray-700">{unit.storage || "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{unit.color || "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{formatPrice(unit.purchasePrice)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={unit.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(unit.dateAdded)}</td>
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