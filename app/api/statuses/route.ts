import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, label, category, forTonight } = body;

    if (!memberId || !label || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Deactivate all existing active statuses for this member
    await prisma.status.updateMany({
      where: {
        memberId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Calculate expiration time if "for tonight"
    let expiresAt: Date | undefined;
    if (forTonight) {
      const tomorrow = new Date();
      tomorrow.setHours(23, 59, 59, 999);
      expiresAt = tomorrow;
    }

    // Create new status
    const status = await prisma.status.create({
      data: {
        memberId,
        label,
        category,
        forTonight: forTonight || false,
        expiresAt,
      },
    });

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error creating status:", error);
    return NextResponse.json(
      { error: "Failed to create status" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const householdCode = searchParams.get("householdCode");

    if (!householdCode) {
      return NextResponse.json(
        { error: "Household code is required" },
        { status: 400 }
      );
    }

    const household = await prisma.household.findUnique({
      where: { code: householdCode },
      include: {
        members: {
          include: {
            statuses: {
              where: { isActive: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!household) {
      return NextResponse.json(
        { error: "Household not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(household.members);
  } catch (error) {
    console.error("Error fetching statuses:", error);
    return NextResponse.json(
      { error: "Failed to fetch statuses" },
      { status: 500 }
    );
  }
}
