"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Clock, RotateCcw, Edit2, Trash2 } from "lucide-react";

interface Member {
  id: string;
  name: string;
  colorHex: string;
  emoji: string | null;
}

interface Chore {
  id: string;
  name: string;
  description: string | null;
  frequency: string;
  assignedMemberId: string | null;
  assignedMember: Member | null;
  lastCompletedAt: Date | string | null;
  nextDueAt: Date | string | null;
  isActive: boolean;
  createdBy: {
    id: string;
    name: string;
  };
}

interface ChoreCardProps {
  chore: Chore;
  currentMemberId: string | null;
  members: Member[];
  onUpdate?: () => void;
}

const frequencyLabels: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  monthly: "Monthly",
};

export function ChoreCard({ chore, currentMemberId, members, onUpdate }: ChoreCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState(chore.name);
  const [editDescription, setEditDescription] = useState(chore.description || "");
  const [editFrequency, setEditFrequency] = useState(chore.frequency);
  const [editAssignedId, setEditAssignedId] = useState(chore.assignedMemberId || "");

  const isOverdue = chore.nextDueAt && new Date(chore.nextDueAt) < new Date() && chore.isActive;
  const isAssignedToMe = chore.assignedMemberId === currentMemberId;

  const handleMarkComplete = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/chores/${chore.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markComplete: true }),
      });

      if (response.ok) {
        onUpdate?.();
      }
    } catch (error) {
      console.error("Error marking chore complete:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/chores/${chore.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDescription || null,
          frequency: editFrequency,
          assignedMemberId: editAssignedId || null,
        }),
      });

      if (response.ok) {
        setShowEdit(false);
        onUpdate?.();
      }
    } catch (error) {
      console.error("Error updating chore:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this chore?")) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/chores/${chore.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onUpdate?.();
      }
    } catch (error) {
      console.error("Error deleting chore:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReassign = async (memberId: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/chores/${chore.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedMemberId: memberId }),
      });

      if (response.ok) {
        onUpdate?.();
      }
    } catch (error) {
      console.error("Error reassigning chore:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (showEdit) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="Description"
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <select
          value={editFrequency}
          onChange={(e) => setEditFrequency(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Bi-weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <select
          value={editAssignedId}
          onChange={(e) => setEditAssignedId(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Unassigned</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.emoji} {member.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            disabled={isUpdating || !editName.trim()}
            className="flex-1 bg-indigo-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-600 disabled:opacity-50 text-sm"
          >
            Save
          </button>
          <button
            onClick={() => setShowEdit(false)}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border p-4 ${isOverdue ? "border-red-200 bg-red-50" : "border-slate-200"}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">{chore.name}</h3>
          {chore.description && (
            <p className="text-sm text-slate-600 mt-1">{chore.description}</p>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setShowEdit(true)}
            className="p-1.5 hover:bg-slate-100 rounded transition-colors"
            title="Edit"
          >
            <Edit2 size={16} className="text-slate-600" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 hover:bg-slate-100 rounded transition-colors"
            title="Delete"
          >
            <Trash2 size={16} className="text-red-600" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
        <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">
          {frequencyLabels[chore.frequency]}
        </span>
        {chore.assignedMember ? (
          <span className="flex items-center gap-1">
            <span>{chore.assignedMember.emoji}</span>
            <span>{chore.assignedMember.name}</span>
          </span>
        ) : (
          <span className="text-slate-400 italic">Unassigned</span>
        )}
      </div>

      {chore.nextDueAt && (
        <div className={`flex items-center gap-2 text-sm mb-3 ${isOverdue ? "text-red-600 font-medium" : "text-slate-600"}`}>
          <Clock size={14} />
          <span>
            Due: {format(new Date(chore.nextDueAt), "MMM d, h:mm a")}
          </span>
        </div>
      )}

      {chore.lastCompletedAt && (
        <div className="text-xs text-slate-500 mb-3">
          Last completed: {format(new Date(chore.lastCompletedAt), "MMM d, h:mm a")}
        </div>
      )}

      <div className="flex gap-2">
        {chore.isActive && (
          <>
            {(isAssignedToMe || currentMemberId === null) && (
              <button
                onClick={handleMarkComplete}
                disabled={isUpdating}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 text-sm"
              >
                <CheckCircle2 size={16} />
                Mark Complete
              </button>
            )}
            <button
              onClick={() => handleReassign("")}
              disabled={isUpdating}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
              title="Reassign"
            >
              <RotateCcw size={16} className="text-slate-600" />
            </button>
          </>
        )}
        {!chore.isActive && (
          <span className="text-sm text-slate-400 italic">Inactive</span>
        )}
      </div>

      {members.length > 1 && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500 mb-1">Quick assign:</div>
          <div className="flex flex-wrap gap-1">
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => handleReassign(member.id)}
                disabled={isUpdating || chore.assignedMemberId === member.id}
                className="px-2 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: chore.assignedMemberId === member.id ? member.colorHex : undefined,
                  color: chore.assignedMemberId === member.id ? "white" : undefined,
                }}
              >
                {member.emoji} {member.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


