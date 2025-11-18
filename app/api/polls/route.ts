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

    const polls = await prisma.poll.findMany({
      where: { householdId: household.id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            colorHex: true,
            emoji: true,
          },
        },
        responses: {
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(polls);
  } catch (error) {
    console.error("Error fetching polls:", error);
    return NextResponse.json(
      { error: "Failed to fetch polls" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { householdCode, question, options, allowMultiple, expiresAt, createdByMemberId } = body;

    if (!householdCode || !question || !options || !Array.isArray(options) || options.length < 2 || !createdByMemberId) {
      return NextResponse.json(
        { error: "Missing required fields or invalid options" },
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

    const poll = await prisma.poll.create({
      data: {
        question,
        options: JSON.stringify(options),
        allowMultiple: allowMultiple || false,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        householdId: household.id,
        createdByMemberId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            colorHex: true,
            emoji: true,
          },
        },
        responses: {
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

    return NextResponse.json(poll);
  } catch (error) {
    console.error("Error creating poll:", error);
    return NextResponse.json(
      { error: "Failed to create poll" },
      { status: 500 }
    );
  }
}


