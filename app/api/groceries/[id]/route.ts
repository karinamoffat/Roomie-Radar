import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isActive, note, takingRequests } = body;

    const updateData: {
      isActive?: boolean;
      note?: string;
      takingRequests?: boolean;
    } = {};

    if (isActive !== undefined) updateData.isActive = isActive;
    if (note !== undefined) updateData.note = note;
    if (takingRequests !== undefined) updateData.takingRequests = takingRequests;

    const groceryTrip = await prisma.groceryTrip.update({
      where: { id },
      data: updateData,
      include: {
        member: true,
        requests: true,
      },
    });

    return NextResponse.json(groceryTrip);
  } catch (error) {
    console.error("Error updating grocery trip:", error);
    return NextResponse.json(
      { error: "Failed to update grocery trip" },
      { status: 500 }
    );
  }
}
