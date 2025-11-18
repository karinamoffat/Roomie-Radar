import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { description, amount, category, date, isSettled } = body;

    const updateData: any = {};
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) updateData.amount = amount;
    if (category !== undefined) updateData.category = category;
    if (date !== undefined) updateData.date = new Date(date);
    if (isSettled !== undefined) updateData.isSettled = isSettled;

    const expense = await prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        paidBy: {
          select: {
            id: true,
            name: true,
            colorHex: true,
            emoji: true,
          },
        },
        splits: {
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
        },
      },
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: "Failed to update expense" },
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

    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}


