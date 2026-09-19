import { prisma } from "@/lib/prisma";
import ShipmentForm from "./shipment-form";

export const dynamic = "force-dynamic";

export default async function NewShipmentPage() {
  const [units, branches] = await Promise.all([
    prisma.inventoryUnit.findMany({
      where: { status: "IN_STOCK" },
      include: { currentBranch: true },
      orderBy: { dateAdded: "desc" },
    }),
    prisma.branch.findMany({ orderBy: [{ isMain: "desc" }, { name: "asc" }] }),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-ink-950">New Shipment</h1>
      <p className="mt-1 text-sm text-ink-600">
        Search and select multiple in-stock units from the same branch to ship together.
      </p>

      <ShipmentForm
        units={units.map((u) => ({
          id: u.id,
          label: `${u.product} ${u.model}${u.imei ? ` (${u.imei})` : ""}`,
          currentBranchId: u.currentBranchId,
          imei: u.imei,
          serialNumber: u.serialNumber,
          product: u.product,
          model: u.model,
          storage: u.storage,
          color: u.color,
        }))}
        branches={branches.map((b) => ({ id: b.id, name: b.name }))}
      />
    </div>
  );
}