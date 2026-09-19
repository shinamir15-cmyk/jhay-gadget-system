import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";

export async function GET() {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const branches = await prisma.branch.findMany({
    orderBy: [{ isMain: "desc" }, { name: "asc" }],
  });

  return NextResponse.json({ branches });
}

export async function POST(request: Request) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { name, code, isMain } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Branch name is required." }, { status: 400 });
    }

    // If this branch is being set as main, unset any existing main branch first
    if (isMain) {
      await prisma.branch.updateMany({
        where: { isMain: true },
        data: { isMain: false },
      });
    }

    const branch = await prisma.branch.create({
      data: {
        name: name.trim(),
        code: code?.trim() || null,
        isMain: Boolean(isMain),
      },
    });

    return NextResponse.json({ branch }, { status: 201 });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A branch with this code already exists." },
        { status: 409 }
      );
    }
    console.error("Create branch error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}