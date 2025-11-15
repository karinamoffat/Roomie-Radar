import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const household = await prisma.household.findUnique({
      where: { code },
      include: {
        members: {
          include: {
            statuses: {
              where: { isActive: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            events: {
              where: {
                startsAt: {
                  gte: new Date(),
                },
              },
              orderBy: { startsAt: "asc" },
              take: 3,
            },
            groceries: {
              where: { isActive: true },
              include: {
                requests: true,
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

    return NextResponse.json(household);
  } catch (error) {
    console.error("Error fetching household:", error);
    return NextResponse.json(
      { error: "Failed to fetch household" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { name } = body;

    const household = await prisma.household.update({
      where: { code },
      data: { name },
    });

    return NextResponse.json(household);
  } catch (error) {
    console.error("Error updating household:", error);
    return NextResponse.json(
      { error: "Failed to update household" },
      { status: 500 }
    );
  }
}
