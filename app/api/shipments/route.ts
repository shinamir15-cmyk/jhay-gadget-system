import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";
import { randomUUID } from "crypto";

type Batch = {
  batchId: string;
  shippedAt: Date;
  fromBranch: string;
  toBranch: string;
  shippedBy: string;
  units: { id: string; label: string }[];
};

export async function GET() {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

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
        units: [],
      });
    }
    batches.get(s.batchId)!.units.push({
      id: s.unit.id,
      label: `${s.unit.product} ${s.unit.model}${s.unit.imei ? ` (${s.unit.imei})` : ""}`,
    });
  }

  return NextResponse.json({ batches: Array.from(batches.values()) });
}

export async function POST(request: Request) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { unitIds, toBranchId } = await request.json();

    if (!Array.isArray(unitIds) || unitIds.length === 0) {
      return NextResponse.json({ error: "Select at least one unit." }, { status: 400 });
    }
    if (!toBranchId) {
      return NextResponse.json({ error: "Destination branch is required." }, { status: 400 });
    }

    const units = await prisma.inventoryUnit.findMany({ where: { id: { in: unitIds } } });

    if (units.length !== unitIds.length) {
      return NextResponse.json({ error: "One or more units were not found." }, { status: 404 });
    }

    const notInStock = units.filter((u) => u.status !== "IN_STOCK");
    if (notInStock.length > 0) {
      return NextResponse.json(
        { error: `Cannot ship: ${notInStock.length} selected unit(s) are not In Stock.` },
        { status: 409 }
      );
    }

    const missingBranch = units.filter((u) => !u.currentBranchId);
    if (missingBranch.length > 0) {
      return NextResponse.json(
        { error: "One or more units have no current branch on record." },
        { status: 400 }
      );
    }

    const distinctBranches = new Set(units.map((u) => u.currentBranchId));
    if (distinctBranches.size > 1) {
      return NextResponse.json(
        { error: "All selected units must currently be at the same branch." },
        { status: 400 }
      );
    }

    const fromBranchId = units[0].currentBranchId!;

    if (fromBranchId === toBranchId) {
      return NextResponse.json(
        { error: "Destination must be different from the current branch." },
        { status: 409 }
      );
    }

    const destinationBranch = await prisma.branch.findUnique({ where: { id: toBranchId } });
    if (!destinationBranch) {
      return NextResponse.json({ error: "Destination branch not found." }, { status: 404 });
    }

    const batchId = randomUUID();

    await prisma.$transaction([
      prisma.shipment.createMany({
        data: units.map((u) => ({
          unitId: u.id,
          fromBranchId,
          toBranchId,
          shippedById: session.userId,
          batchId,
        })),
      }),
      prisma.inventoryUnit.updateMany({
        where: { id: { in: unitIds } },
        data: { status: "SHIPPED", currentBranchId: toBranchId },
      }),
    ]);

    return NextResponse.json({ batchId }, { status: 201 });
  } catch (error) {
    console.error("Create shipment error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}