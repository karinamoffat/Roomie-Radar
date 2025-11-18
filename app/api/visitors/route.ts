import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    });

    if (!household) {
      return NextResponse.json(
        { error: "Household not found" },
        { status: 404 }
      );
    }

    const visitors = await prisma.visitor.findMany({
      where: { householdId: household.id },
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
      orderBy: [
        { checkOutDate: { sort: "asc", nulls: "first" } }, // Current visitors first
        { checkInDate: "desc" },
      ],
    });

    return NextResponse.json(visitors);
  } catch (error) {
    console.error("Error fetching visitors:", error);
    return NextResponse.json(
      { error: "Failed to fetch visitors" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { householdCode, visitorName, hostMemberId, checkInDate, checkOutDate, notes } = body;

    if (!householdCode || !visitorName || !hostMemberId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const household = await prisma.household.findUnique({
      where: { code: householdCode },
    });

    if (!household) {
      return NextResponse.json(
        { error: "Household not found" },
        { status: 404 }
      );
    }

    const visitor = await prisma.visitor.create({
      data: {
        visitorName,
        hostMemberId,
        householdId: household.id,
        checkInDate: checkInDate ? new Date(checkInDate) : new Date(),
        checkOutDate: checkOutDate ? new Date(checkOutDate) : null,
        notes: notes || null,
      },
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
    console.error("Error creating visitor:", error);
    return NextResponse.json(
      { error: "Failed to create visitor" },
      { status: 500 }
    );
  }
}


