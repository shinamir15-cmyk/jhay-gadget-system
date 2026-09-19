import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { name, code, isMain } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Branch name is required." }, { status: 400 });
    }

    if (isMain) {
      await prisma.branch.updateMany({
        where: { isMain: true, NOT: { id } },
        data: { isMain: false },
      });
    }

    const branch = await prisma.branch.update({
      where: { id },
      data: {
        name: name.trim(),
        code: code?.trim() || null,
        isMain: Boolean(isMain),
      },
    });

    return NextResponse.json({ branch });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "A branch with this code already exists." },
          { status: 409 }
        );
      }
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Branch not found." }, { status: 404 });
      }
    }
    console.error("Update branch error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const unitCount = await prisma.inventoryUnit.count({ where: { currentBranchId: id } });
    if (unitCount > 0) {
      return NextResponse.json(
        {
          error: `Can't delete: ${unitCount} unit${unitCount !== 1 ? "s" : ""} still assigned to this branch. Reassign or ship them out first.`,
        },
        { status: 409 }
      );
    }

    await prisma.branch.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "Branch not found." }, { status: 404 });
    }
    console.error("Delete branch error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}