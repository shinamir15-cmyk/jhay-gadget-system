import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;

    const unit = await prisma.inventoryUnit.findUnique({ where: { id } });

    if (!unit) {
      return NextResponse.json({ error: "Unit not found." }, { status: 404 });
    }

    if (unit.status !== "REPAIR") {
      return NextResponse.json(
        { error: `Cannot return to inventory: unit is currently ${unit.status}.` },
        { status: 409 }
      );
    }

    const updated = await prisma.inventoryUnit.update({
      where: { id },
      data: { status: "IN_STOCK" },
    });

    return NextResponse.json({ unit: updated });
  } catch (error) {
    console.error("Return unit error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}