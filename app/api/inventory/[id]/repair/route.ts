import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const unit = await prisma.inventoryUnit.findUnique({ where: { id } });

    if (!unit) {
      return NextResponse.json({ error: "Unit not found." }, { status: 404 });
    }

    if (unit.status !== "IN_STOCK") {
      return NextResponse.json(
        { error: `Cannot send to repair: unit is currently ${unit.status}.` },
        { status: 409 }
      );
    }

    const updated = await prisma.inventoryUnit.update({
      where: { id },
      data: { status: "REPAIR" },
    });

    return NextResponse.json({ unit: updated });
  } catch (error) {
    console.error("Repair unit error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}