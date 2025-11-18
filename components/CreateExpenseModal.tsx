"use client";

import { useState } from "react";
import { Dialog } from "./Dialog";

interface CreateExpenseModalProps {
  open: boolean;
  onClose: () => void;
  householdCode: string;
  members: Array<{ id: string; name: string; colorHex: string; emoji: string | null }>;
  currentMemberId: string;
  onSuccess?: () => void;
}

export function CreateExpenseModal({
  open,
  onClose,
  householdCode,
  members,
  currentMemberId,
  onSuccess,
}: CreateExpenseModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("other");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paidByMemberId, setPaidByMemberId] = useState(currentMemberId);
  const [splitMemberIds, setSplitMemberIds] = useState<string[]>(members.map((m) => m.id));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleMember = (memberId: string) => {
    if (splitMemberIds.includes(memberId)) {
      setSplitMemberIds(splitMemberIds.filter((id) => id !== memberId));
    } else {
      setSplitMemberIds([...splitMemberIds, memberId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim() || !amount || parseFloat(amount) <= 0 || splitMemberIds.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          householdCode,
          description: description.trim(),
          amount: parseFloat(amount),
          category,
          date: new Date(date).toISOString(),
          paidByMemberId,
          splitMemberIds,
        }),
      });

      if (response.ok) {
        onSuccess?.();
        onClose();
        setDescription("");
        setAmount("");
        setCategory("other");
        setDate(new Date().toISOString().split("T")[0]);
        setPaidByMemberId(currentMemberId);
        setSplitMemberIds(members.map((m) => m.id));
      }
    } catch (error) {
      console.error("Error creating expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const splitAmount = amount && splitMemberIds.length > 0
    ? (parseFloat(amount) / splitMemberIds.length).toFixed(2)
    : "0.00";

  return (
    <Dialog open={open} onClose={onClose} title="Add Expense" className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Description *
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Groceries, Electric bill, Pizza"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Amount *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="groceries">Groceries</option>
              <option value="utilities">Utilities</option>
              <option value="rent">Rent</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Paid By *
          </label>
          <select
            value={paidByMemberId}
            onChange={(e) => setPaidByMemberId(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.emoji} {member.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Split Between * ({splitMemberIds.length} {splitMemberIds.length === 1 ? "person" : "people"} - ${splitAmount} each)
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3">
            {members.map((member) => (
              <label
                key={member.id}
                className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={splitMemberIds.includes(member.id)}
                  onChange={() => handleToggleMember(member.id)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  disabled={splitMemberIds.length === 1 && splitMemberIds.includes(member.id)}
                />
                <span className="text-lg">{member.emoji}</span>
                <span className="flex-1 text-slate-700">{member.name}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !description.trim() || !amount || parseFloat(amount) <= 0 || splitMemberIds.length === 0}
          className="w-full bg-indigo-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : "Add Expense"}
        </button>
      </form>
    </Dialog>
  );
}


