import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { householdCode, name, colorHex, emoji } = body;

    if (!householdCode || !name || !colorHex) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find household
    const household = await prisma.household.findUnique({
      where: { code: householdCode },
    });

    if (!household) {
      return NextResponse.json(
        { error: "Household not found" },
        { status: 404 }
      );
    }

    // Create member
    const member = await prisma.member.create({
      data: {
        name,
        colorHex,
        emoji: emoji || "👤",
        householdId: household.id,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("Error creating member:", error);
    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 }
    );
  }
}
