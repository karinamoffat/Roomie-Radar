"use client";

import { useState } from "react";
import { ExpenseCard } from "./ExpenseCard";
import { CreateExpenseModal } from "./CreateExpenseModal";
import { SettlementSummary } from "./SettlementSummary";
import { Plus, Calculator } from "lucide-react";

interface Member {
  id: string;
  name: string;
  colorHex: string;
  emoji: string | null;
}

interface ExpenseSplit {
  id: string;
  memberId: string;
  member: Member;
  amount: number;
  isPaid: boolean;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string | null;
  date: Date | string;
  paidBy: Member;
  isSettled: boolean;
  splits: ExpenseSplit[];
}

interface ExpenseListProps {
  expenses: Expense[];
  householdCode: string;
  currentMemberId: string | null;
  members: Member[];
  onUpdate?: () => void;
}

export function ExpenseList({
  expenses,
  householdCode,
  currentMemberId,
  members,
  onUpdate,
}: ExpenseListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);

  if (!currentMemberId) {
    return (
      <div className="text-center py-8 text-slate-500">
        Please join this household to view expenses.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">Expenses</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettlement(true)}
            className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors"
          >
            <Calculator size={18} />
            Settlements
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-600 transition-colors"
          >
            <Plus size={18} />
            Add Expense
          </button>
        </div>
      </div>

      <SettlementSummary
        open={showSettlement}
        onClose={() => setShowSettlement(false)}
        householdCode={householdCode}
        members={members}
      />

      {expenses.length > 0 ? (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              currentMemberId={currentMemberId}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg border border-slate-200 text-slate-500">
          No expenses yet. Add one to get started!
        </div>
      )}

      <CreateExpenseModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        householdCode={householdCode}
        members={members}
        currentMemberId={currentMemberId}
        onSuccess={onUpdate}
      />
    </div>
  );
}


