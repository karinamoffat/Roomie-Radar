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
        members: true,
        expenses: {
          where: { isSettled: false },
          include: {
            paidBy: true,
            splits: {
              include: {
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

    // Calculate who owes whom
    const balances: Record<string, number> = {};
    
    household.members.forEach((member) => {
      balances[member.id] = 0;
    });

    household.expenses.forEach((expense) => {
      const payerId = expense.paidBy.id;
      
      // Payer gets credited with the full amount
      balances[payerId] = (balances[payerId] || 0) + expense.amount;

      // Each split member owes their portion
      expense.splits.forEach((split) => {
        if (split.memberId !== payerId) {
          // Only count if they haven't paid yet
          if (!split.isPaid) {
            balances[split.memberId] = (balances[split.memberId] || 0) - split.amount;
          }
        }
      });
    });

    // Build settlement summary
    const settlements: Array<{
      from: { id: string; name: string; emoji: string | null; colorHex: string };
      to: { id: string; name: string; emoji: string | null; colorHex: string };
      amount: number;
    }> = [];

    const memberMap = new Map(household.members.map((m) => [m.id, m]));
    
    // Find who owes whom (simplified - not optimal but works for small groups)
    const debtorIds = Object.keys(balances).filter((id) => balances[id] < 0);
    const creditorIds = Object.keys(balances).filter((id) => balances[id] > 0);

    for (const debtorId of debtorIds) {
      let remainingDebt = Math.abs(balances[debtorId]);
      
      for (const creditorId of creditorIds) {
        if (remainingDebt <= 0 || balances[creditorId] <= 0) continue;

        const amount = Math.min(remainingDebt, balances[creditorId]);
        
        settlements.push({
          from: {
            id: debtorId,
            name: memberMap.get(debtorId)!.name,
            emoji: memberMap.get(debtorId)!.emoji,
            colorHex: memberMap.get(debtorId)!.colorHex,
          },
          to: {
            id: creditorId,
            name: memberMap.get(creditorId)!.name,
            emoji: memberMap.get(creditorId)!.emoji,
            colorHex: memberMap.get(creditorId)!.colorHex,
          },
          amount: parseFloat(amount.toFixed(2)),
        });

        remainingDebt -= amount;
        balances[creditorId] -= amount;
      }
    }

    return NextResponse.json({ settlements, balances });
  } catch (error) {
    console.error("Error calculating settlements:", error);
    return NextResponse.json(
      { error: "Failed to calculate settlements" },
      { status: 500 }
    );
  }
}


