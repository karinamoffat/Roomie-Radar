import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, title, type, startsAt, endsAt, location, details, isHousewide } = body;

    if (!memberId || !title || !type || !startsAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        memberId,
        title,
        type,
        startsAt: new Date(startsAt),
        endsAt: endsAt ? new Date(endsAt) : null,
        location,
        details,
        isHousewide: isHousewide || false,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
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
            events: {
              where: {
                startsAt: {
                  gte: new Date(),
                },
              },
              orderBy: { startsAt: "asc" },
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

    // Flatten events from all members
    const allEvents = household.members.flatMap((member) =>
      member.events.map((event) => ({
        ...event,
        member: {
          id: member.id,
          name: member.name,
          emoji: member.emoji,
          colorHex: member.colorHex,
        },
      }))
    );

    // Sort by start date
    allEvents.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

    return NextResponse.json(allEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
