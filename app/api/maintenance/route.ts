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

    const issues = await prisma.maintenanceIssue.findMany({
      where: { householdId: household.id },
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
      orderBy: [
        { status: "asc" }, // reported first, then in-progress, then resolved
        { priority: "desc" }, // high, medium, low
        { reportedAt: "desc" },
      ],
    });

    return NextResponse.json(issues);
  } catch (error) {
    console.error("Error fetching maintenance issues:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance issues" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { householdCode, title, description, category, priority, reportedByMemberId } = body;

    if (!householdCode || !title || !category || !reportedByMemberId) {
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

    const issue = await prisma.maintenanceIssue.create({
      data: {
        title,
        description: description || null,
        category,
        priority: priority || "medium",
        householdId: household.id,
        reportedByMemberId,
        status: "reported",
      },
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
    console.error("Error creating maintenance issue:", error);
    return NextResponse.json(
      { error: "Failed to create maintenance issue" },
      { status: 500 }
    );
  }
}


