import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, message } = body;

    if (!memberId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        memberId,
        message,
      },
      include: {
        member: true,
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
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
            announcements: {
              orderBy: { createdAt: "desc" },
              take: 10, // Get last 10 announcements per member
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

    // Flatten all announcements from all members
    const allAnnouncements = household.members
      .flatMap((member) =>
        member.announcements.map((ann) => ({
          ...ann,
          member: {
            id: member.id,
            name: member.name,
            emoji: member.emoji,
            colorHex: member.colorHex,
          },
        }))
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 20); // Return top 20 most recent announcements

    return NextResponse.json(allAnnouncements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}
