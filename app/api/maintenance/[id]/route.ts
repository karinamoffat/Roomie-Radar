import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, category, status, priority } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) {
      updateData.status = status;
      // If marking as resolved, set resolvedAt
      if (status === "resolved" && !updateData.resolvedAt) {
        updateData.resolvedAt = new Date();
      } else if (status !== "resolved") {
        updateData.resolvedAt = null;
      }
    }
    if (priority !== undefined) updateData.priority = priority;

    const issue = await prisma.maintenanceIssue.update({
      where: { id },
      data: updateData,
      include: {
        reportedBy: {
          select: {
            id: true,
            name: true,
            colorHex: true,
            emoji: true,
          },
        },
      },
    });

    return NextResponse.json(issue);
  } catch (error) {
    console.error("Error updating maintenance issue:", error);
    return NextResponse.json(
      { error: "Failed to update maintenance issue" },
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

    await prisma.maintenanceIssue.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting maintenance issue:", error);
    return NextResponse.json(
      { error: "Failed to delete maintenance issue" },
      { status: 500 }
    );
  }
}


