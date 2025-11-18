import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { visitorName, checkInDate, checkOutDate, notes } = body;

    const updateData: any = {};
    if (visitorName !== undefined) updateData.visitorName = visitorName;
    if (checkInDate !== undefined) updateData.checkInDate = new Date(checkInDate);
    if (checkOutDate !== undefined) updateData.checkOutDate = checkOutDate ? new Date(checkOutDate) : null;
    if (notes !== undefined) updateData.notes = notes;

    const visitor = await prisma.visitor.update({
      where: { id },
      data: updateData,
      include: {
        host: {
          select: {
            id: true,
            name: true,
            colorHex: true,
            emoji: true,
          },
        },
      },
    });

    return NextResponse.json(visitor);
  } catch (error) {
    console.error("Error updating visitor:", error);
    return NextResponse.json(
      { error: "Failed to update visitor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.visitor.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting visitor:", error);
    return NextResponse.json(
      { error: "Failed to delete visitor" },
      { status: 500 }
    );
  }
}


