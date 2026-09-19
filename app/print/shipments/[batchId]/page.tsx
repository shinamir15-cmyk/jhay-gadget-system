import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrintButton from "./print-button";

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatPrice(value: unknown) {
  const num = Number(value);
  return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

export default async function PrintShipmentPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;

  const shipments = await prisma.shipment.findMany({
    where: { batchId },
    include: { unit: true, fromBranch: true, toBranch: true, shippedBy: true },
    orderBy: { shippedAt: "asc" },
  });

  if (shipments.length === 0) notFound();

  const first = shipments[0];

  return (
    <div className="mx-auto max-w-3xl p-8 text-ink-950">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <h1 className="text-lg font-semibold">Shipment Slip Preview</h1>
        <PrintButton />
      </div>

      <div className="rounded-lg border border-ink-400/20 p-8">
        <div className="flex items-start justify-between border-b border-ink-400/20 pb-4">
          <div>
            <h2 className="text-xl font-bold">Jhay Gadget</h2>
            <p className="text-sm text-ink-600">Shipment Slip</p>
          </div>
          <div className="text-right text-sm text-ink-600">
            <p>Batch ID: {batchId}</p>
            <p>{formatDateTime(first.shippedAt)}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">From</p>
            <p className="mt-1 text-sm font-medium">{first.fromBranch.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">To</p>
            <p className="mt-1 text-sm font-medium">{first.toBranch.name}</p>
          </div>
        </div>

        <div className="mt-6 border-t border-ink-400/20 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
            Units ({shipments.length})
          </p>
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="border-b border-ink-400/20 text-left text-xs text-ink-400">
                <th className="py-1.5 font-medium">Product</th>
                <th className="py-1.5 font-medium">Storage / Color</th>
                <th className="py-1.5 font-medium">Serial Number</th>
                <th className="py-1.5 text-right font-medium">Price</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.id} className="border-b border-ink-400/10 last:border-b-0">
                  <td className="py-1.5">
                    {s.unit.product} {s.unit.model}
                  </td>
                  <td className="py-1.5">
                    {s.unit.storage || "—"} / {s.unit.color || "—"}
                  </td>
                  <td className="py-1.5">{s.unit.serialNumber ?? "—"}</td>
                  <td className="py-1.5 text-right">{formatPrice(s.unit.purchasePrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 border-t border-ink-400/20 pt-4 text-sm">
          <p className="text-ink-600">
            Shipped by:{" "}
            <span className="font-medium text-ink-950">{first.shippedBy?.name ?? "—"}</span>
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-6 text-sm">
          <div>
            <div className="h-12 border-b border-ink-400/40" />
            <p className="mt-1 text-xs text-ink-400">Released by</p>
          </div>
          <div>
            <div className="h-12 border-b border-ink-400/40" />
            <p className="mt-1 text-xs text-ink-400">Received by</p>
          </div>
        </div>
      </div>
    </div>
  );
}