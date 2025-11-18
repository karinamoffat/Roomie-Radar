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
      include: {
        chores: {
          include: {
            assignedMember: {
              select: {
                id: true,
                name: true,
                colorHex: true,
                emoji: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: [
            { isActive: "desc" },
            { nextDueAt: "asc" },
          ],
        },
      },
    });

    if (!household) {
      return NextResponse.json(
        { error: "Household not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(household.chores);
  } catch (error) {
    console.error("Error fetching chores:", error);
    return NextResponse.json(
      { error: "Failed to fetch chores" },
      { status: 500 }
    );
  }
}

function calculateNextDue(frequency: string, lastCompletedAt: Date | null): Date {
  const now = new Date();
  const nextDue = lastCompletedAt ? new Date(lastCompletedAt) : new Date(now);

  switch (frequency) {
    case "daily":
      nextDue.setDate(nextDue.getDate() + 1);
      break;
    case "weekly":
      nextDue.setDate(nextDue.getDate() + 7);
      break;
    case "biweekly":
      nextDue.setDate(nextDue.getDate() + 14);
      break;
    case "monthly":
      nextDue.setMonth(nextDue.getMonth() + 1);
      break;
    default:
      nextDue.setDate(nextDue.getDate() + 7);
  }

  return nextDue;
}

function getNextMember(chores: any[], currentMemberId: string | null, allMembers: any[]): any {
  if (allMembers.length === 0) return null;
  
  if (!currentMemberId) {
    // If no one is assigned, assign to first member
    return allMembers[0];
  }

  // Find current member index
  const currentIndex = allMembers.findIndex((m) => m.id === currentMemberId);
  if (currentIndex === -1) return allMembers[0];

  // Get counts of chores per member
  const choreCounts = allMembers.map((member) => ({
    member,
    count: chores.filter((c) => c.assignedMemberId === member.id && c.isActive).length,
  }));

  // Sort by count, then by index
  choreCounts.sort((a, b) => {
    if (a.count !== b.count) return a.count - b.count;
    return allMembers.indexOf(a.member) - allMembers.indexOf(b.member);
  });

  // Return member with least chores, or next in rotation if tied
  const minCount = choreCounts[0].count;
  const tiedMembers = choreCounts.filter((c) => c.count === minCount).map((c) => c.member);
  
  const currentInTied = tiedMembers.findIndex((m) => m.id === currentMemberId);
  if (currentInTied >= 0) {
    // Rotate within tied members
    const nextInTied = (currentInTied + 1) % tiedMembers.length;
    return tiedMembers[nextInTied];
  }

  return tiedMembers[0];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { householdCode, name, description, frequency, createdById, assignedMemberId } = body;

    if (!householdCode || !name || !frequency || !createdById) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const household = await prisma.household.findUnique({
      where: { code: householdCode },
      include: { members: true },
    });

    if (!household) {
      return NextResponse.json(
        { error: "Household not found" },
        { status: 404 }
      );
    }

    // Get all active chores to determine next assignee
    const existingChores = await prisma.chore.findMany({
      where: { householdId: household.id, isActive: true },
    });

    let assigneeId = assignedMemberId;
    if (!assigneeId) {
      // Auto-assign using rotation logic
      const nextMember = getNextMember(existingChores, null, household.members);
      assigneeId = nextMember?.id || null;
    }

    const nextDueAt = calculateNextDue(frequency, null);

    const chore = await prisma.chore.create({
      data: {
        name,
        description: description || null,
        frequency,
        householdId: household.id,
        createdById,
        assignedMemberId: assigneeId,
        nextDueAt,
      },
      include: {
        assignedMember: {
          select: {
            id: true,
            name: true,
            colorHex: true,
            emoji: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(chore);
  } catch (error) {
    console.error("Error creating chore:", error);
    return NextResponse.json(
      { error: "Failed to create chore" },
      { status: 500 }
    );
  }
}


