import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateTransition } from "@/lib/inventory-transitions";
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

    const result = validateTransition("sell", unit.status);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    const updated = await prisma.inventoryUnit.update({
      where: { id },
      data: { status: result.nextStatus },
    });

    return NextResponse.json({ unit: updated });
  } catch (error) {
    console.error("Sell unit error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}