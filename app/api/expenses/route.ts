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

    const expenses = await prisma.expense.findMany({
      where: { householdId: household.id },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true,
            colorHex: true,
            emoji: true,
          },
        },
        splits: {
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
      orderBy: { date: "desc" },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { householdCode, description, amount, category, date, paidByMemberId, splitMemberIds } = body;

    if (!householdCode || !description || amount === undefined || !paidByMemberId || !splitMemberIds || splitMemberIds.length === 0) {
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

    // Verify all split members exist
    const validMemberIds = household.members.map((m) => m.id);
    if (!validMemberIds.includes(paidByMemberId) || !splitMemberIds.every((id: string) => validMemberIds.includes(id))) {
      return NextResponse.json(
        { error: "Invalid member IDs" },
        { status: 400 }
      );
    }

    const splitAmount = amount / splitMemberIds.length;

    const expense = await prisma.expense.create({
      data: {
        description,
        amount,
        category: category || null,
        date: date ? new Date(date) : new Date(),
        householdId: household.id,
        paidByMemberId,
        splits: {
          create: splitMemberIds.map((memberId: string) => ({
            memberId,
            amount: splitAmount,
            isPaid: memberId === paidByMemberId, // Payer doesn't owe themselves
          })),
        },
      },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true,
            colorHex: true,
            emoji: true,
          },
        },
        splits: {
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

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}


