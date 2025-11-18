import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function calculateNextDue(frequency: string, lastCompletedAt: Date | null): Date {
  const nextDue = lastCompletedAt ? new Date(lastCompletedAt) : new Date();

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
    return allMembers[0];
  }

  const choreCounts = allMembers.map((member) => ({
    member,
    count: chores.filter((c) => c.assignedMemberId === member.id && c.isActive).length,
  }));

  choreCounts.sort((a, b) => {
    if (a.count !== b.count) return a.count - b.count;
    return allMembers.indexOf(a.member) - allMembers.indexOf(b.member);
  });

  const minCount = choreCounts[0].count;
  const tiedMembers = choreCounts.filter((c) => c.count === minCount).map((c) => c.member);
  
  const currentInTied = tiedMembers.findIndex((m) => m.id === currentMemberId);
  if (currentInTied >= 0) {
    const nextInTied = (currentInTied + 1) % tiedMembers.length;
    return tiedMembers[nextInTied];
  }

  return tiedMembers[0];
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, frequency, assignedMemberId, isActive, markComplete } = body;

    const chore = await prisma.chore.findUnique({
      where: { id },
      include: {
        household: {
          include: { members: true },
        },
      },
    });

    if (!chore) {
      return NextResponse.json(
        { error: "Chore not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    if (markComplete) {
      // Mark as complete and rotate assignment
      updateData.lastCompletedAt = new Date();
      
      // Get all active chores for rotation
      const allChores = await prisma.chore.findMany({
        where: { householdId: chore.householdId, isActive: true },
      });

      // Calculate next due date
      const nextDueAt = calculateNextDue(chore.frequency, new Date());
      updateData.nextDueAt = nextDueAt;

      // Rotate assignment
      let nextAssigneeId = assignedMemberId;
      if (!nextAssigneeId) {
        const nextMember = getNextMember(
          allChores,
          chore.assignedMemberId,
          chore.household.members
        );
        nextAssigneeId = nextMember?.id || null;
      }
      updateData.assignedMemberId = nextAssigneeId;
    } else if (assignedMemberId !== undefined) {
      updateData.assignedMemberId = assignedMemberId;
    }

    const updatedChore = await prisma.chore.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedChore);
  } catch (error) {
    console.error("Error updating chore:", error);
    return NextResponse.json(
      { error: "Failed to update chore" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.chore.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chore:", error);
    return NextResponse.json(
      { error: "Failed to delete chore" },
      { status: 500 }
    );
  }
}


