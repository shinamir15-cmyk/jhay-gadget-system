import { prisma } from "@/lib/prisma";
import Link from "next/link";

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type Batch = {
  batchId: string;
  shippedAt: Date;
  fromBranch: string;
  toBranch: string;
  shippedBy: string;
  unitCount: number;
};

export default async function ShipmentsPage() {
  const shipments = await prisma.shipment.findMany({
    include: { unit: true, fromBranch: true, toBranch: true, shippedBy: true },
    orderBy: { shippedAt: "desc" },
  });

  const batches = new Map<string, Batch>();

  for (const s of shipments) {
    if (!batches.has(s.batchId)) {
      batches.set(s.batchId, {
        batchId: s.batchId,
        shippedAt: s.shippedAt,
        fromBranch: s.fromBranch.name,
        toBranch: s.toBranch.name,
        shippedBy: s.shippedBy?.name ?? "—",
        unitCount: 0,
      });
    }
    batches.get(s.batchId)!.unitCount += 1;
  }

  const batchList = Array.from(batches.values());

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-950">Shipments</h1>
          <p className="mt-1 text-sm text-ink-600">
            {batchList.length} shipment{batchList.length !== 1 ? "s" : ""} recorded
          </p>
        </div>
        <Link
          href="/shipments/new"
          className="inline-block rounded-md bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-700"
        >
          + New Shipment
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg bg-card shadow-sm ring-1 ring-ink-400/15">
        <table className="min-w-full divide-y divide-ink-400/15 text-sm">
          <thead className="bg-surface">
            <tr>
              {["From", "To", "Units", "Shipped By", "Date", ""].map((header) => (
                <th key={header} className="px-4 py-3 text-left font-medium text-ink-600">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-400/10">
            {batchList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-400">
                  No shipments yet. Click &quot;New Shipment&quot; to create one.
                </td>
              </tr>
            ) : (
              batchList.map((b) => (
                <tr key={b.batchId} className="hover:bg-surface">
                  <td className="px-4 py-3 text-ink-800">{b.fromBranch}</td>
                  <td className="px-4 py-3 text-ink-800">{b.toBranch}</td>
                  <td className="px-4 py-3 text-ink-800">
                    {b.unitCount} unit{b.unitCount !== 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-3 text-ink-800">{b.shippedBy}</td>
                  <td className="px-4 py-3 text-ink-800">{formatDateTime(b.shippedAt)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/print/shipments/${b.batchId}`}
                      target="_blank"
                      className="text-xs font-medium text-brand-600 hover:underline"
                    >
                      Print
                    </Link>
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