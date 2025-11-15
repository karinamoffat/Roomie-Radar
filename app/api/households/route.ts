import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Household code is required" },
        { status: 400 }
      );
    }

    // Check if household already exists
    let household = await prisma.household.findUnique({
      where: { code },
      include: { members: true },
    });

    // If not, create it
    if (!household) {
      household = await prisma.household.create({
        data: {
          code,
          name: name || `${code}'s House`,
        },
        include: { members: true },
      });
    }

    return NextResponse.json(household);
  } catch (error) {
    console.error("Error creating/getting household:", error);
    return NextResponse.json(
      { error: "Failed to create/get household" },
      { status: 500 }
    );
  }
}
