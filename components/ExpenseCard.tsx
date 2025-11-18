"use client";

import { useState } from "react";
import { format } from "date-fns";
import { DollarSign, CheckCircle2, XCircle, Trash2 } from "lucide-react";

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

interface ExpenseCardProps {
  expense: Expense;
  currentMemberId: string | null;
  onUpdate?: () => void;
}

const categoryLabels: Record<string, string> = {
  groceries: "Groceries",
  utilities: "Utilities",
  rent: "Rent",
  other: "Other",
};

export function ExpenseCard({ expense, currentMemberId, onUpdate }: ExpenseCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleMarkPaid = async (splitId: string, isPaid: boolean) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/expenses/${expense.id}/splits/${splitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaid }),
      });

      if (response.ok) {
        onUpdate?.();
      }
    } catch (error) {
      console.error("Error updating split:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onUpdate?.();
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const mySplit = expense.splits.find((s) => s.memberId === currentMemberId);
  const allPaid = expense.splits.every((s) => s.isPaid);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900">{expense.description}</h3>
            {expense.category && (
              <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">
                {categoryLabels[expense.category] || expense.category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <DollarSign size={14} />
            <span className="font-medium">${expense.amount.toFixed(2)}</span>
            <span className="text-slate-400">•</span>
            <span>{format(new Date(expense.date), "MMM d, yyyy")}</span>
          </div>
          <div className="text-sm text-slate-600 mt-1">
            Paid by: {expense.paidBy.emoji} {expense.paidBy.name}
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="p-1.5 hover:bg-slate-100 rounded transition-colors"
          title="Delete"
        >
          <Trash2 size={16} className="text-red-600" />
        </button>
      </div>

      <div className="space-y-2 pt-3 border-t border-slate-100">
        <div className="text-xs font-medium text-slate-600 mb-1">Splits:</div>
        {expense.splits.map((split) => (
          <div
            key={split.id}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <span>{split.member.emoji}</span>
              <span className={split.memberId === currentMemberId ? "font-medium" : ""}>
                {split.member.name}
              </span>
              {split.memberId === expense.paidBy.id && (
                <span className="text-xs text-slate-400">(paid)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={split.isPaid ? "text-emerald-600" : "text-slate-900"}>
                ${split.amount.toFixed(2)}
              </span>
              {split.memberId !== expense.paidBy.id && (
                <button
                  onClick={() => handleMarkPaid(split.id, !split.isPaid)}
                  disabled={isUpdating}
                  className={`p-1 rounded transition-colors ${
                    split.isPaid
                      ? "text-emerald-600 hover:bg-emerald-50"
                      : "text-slate-400 hover:bg-slate-100"
                  }`}
                  title={split.isPaid ? "Mark as unpaid" : "Mark as paid"}
                >
                  {split.isPaid ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <XCircle size={16} />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {allPaid && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
            <CheckCircle2 size={16} />
            All settled
          </div>
        </div>
      )}
    </div>
  );
}


