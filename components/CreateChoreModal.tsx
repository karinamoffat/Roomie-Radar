"use client";

import { useState } from "react";
import { Dialog } from "./Dialog";

interface CreateChoreModalProps {
  open: boolean;
  onClose: () => void;
  householdCode: string;
  createdById: string;
  members: Array<{ id: string; name: string; colorHex: string; emoji: string | null }>;
  onSuccess?: () => void;
}

export function CreateChoreModal({
  open,
  onClose,
  householdCode,
  createdById,
  members,
  onSuccess,
}: CreateChoreModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [assignedMemberId, setAssignedMemberId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/chores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          householdCode,
          name: name.trim(),
          description: description.trim() || null,
          frequency,
          createdById,
          assignedMemberId: assignedMemberId || null,
        }),
      });

      if (response.ok) {
        onSuccess?.();
        onClose();
        setName("");
        setDescription("");
        setFrequency("weekly");
        setAssignedMemberId("");
      }
    } catch (error) {
      console.error("Error creating chore:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Create Chore" className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Chore Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Take out trash, Vacuum living room"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Any additional notes..."
            rows={2}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Frequency *
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Assign To (optional - will auto-assign if not specified)
          </label>
          <select
            value={assignedMemberId}
            onChange={(e) => setAssignedMemberId(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Auto-assign (recommended)</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.emoji} {member.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="w-full bg-indigo-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : "Create Chore"}
        </button>
      </form>
    </Dialog>
  );
}


