import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; splitId: string }> }
) {
  try {
    const { splitId } = await params;
    const body = await request.json();
    const { isPaid } = body;

    const split = await prisma.expenseSplit.update({
      where: { id: splitId },
      data: { isPaid },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            colorHex: true,
            emoji: true,
          },
        },
      },
    });

    return NextResponse.json(split);
  } catch (error) {
    console.error("Error updating expense split:", error);
    return NextResponse.json(
      { error: "Failed to update expense split" },
      { status: 500 }
    );
  }
}


