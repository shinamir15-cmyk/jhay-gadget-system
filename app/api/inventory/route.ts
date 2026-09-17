import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "../../../generated/prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product, model, storage, color, imei, serialNumber, purchasePrice, dateAdded } = body;

    // Required field validation
    if (!product?.trim() || !model?.trim()) {
      return NextResponse.json(
        { error: "Product and model are required." },
        { status: 400 }
      );
    }

    const price = Number(purchasePrice);
    if (!purchasePrice || Number.isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Purchase price must be a valid positive number." },
        { status: 400 }
      );
    }

    const unit = await prisma.inventoryUnit.create({
      data: {
        product: product.trim(),
        model: model.trim(),
        storage: storage?.trim() || "",
        color: color?.trim() || "",
        imei: imei?.trim() || null,
        serialNumber: serialNumber?.trim() || null,
        purchasePrice: price,
        dateAdded: dateAdded ? new Date(dateAdded) : new Date(),
        status: "IN_STOCK",
      },
    });

    return NextResponse.json({ unit }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = (error.meta?.target as string[] | undefined)?.join(", ") ?? "field";
      return NextResponse.json(
        { error: `A unit with this ${target} already exists.` },
        { status: 409 }
      );
    }

    console.error("Add unit error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}