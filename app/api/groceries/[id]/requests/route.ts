import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { requestedBy, item } = body;

    if (!requestedBy || !item) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const groceryRequest = await prisma.groceryRequest.create({
      data: {
        tripId: id,
        requestedBy,
        item,
      },
    });

    return NextResponse.json(groceryRequest);
  } catch (error) {
    console.error("Error creating grocery request:", error);
    return NextResponse.json(
      { error: "Failed to create grocery request" },
      { status: 500 }
    );
  }
}
