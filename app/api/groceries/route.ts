import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, storeName, leavingAt, note, takingRequests } = body;

    if (!memberId || !storeName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const groceryTrip = await prisma.groceryTrip.create({
      data: {
        memberId,
        storeName,
        leavingAt: leavingAt ? new Date(leavingAt) : null,
        note,
        takingRequests: takingRequests !== undefined ? takingRequests : true,
      },
      include: {
        member: true,
        requests: true,
      },
    });

    return NextResponse.json(groceryTrip);
  } catch (error) {
    console.error("Error creating grocery trip:", error);
    return NextResponse.json(
      { error: "Failed to create grocery trip" },
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
            groceries: {
              where: { isActive: true },
              include: {
                requests: {
                  orderBy: { createdAt: "asc" },
                },
                member: true,
              },
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

    // Flatten grocery trips from all members
    const allGroceryTrips = household.members.flatMap((member) => member.groceries);

    return NextResponse.json(allGroceryTrips);
  } catch (error) {
    console.error("Error fetching grocery trips:", error);
    return NextResponse.json(
      { error: "Failed to fetch grocery trips" },
      { status: 500 }
    );
  }
}
