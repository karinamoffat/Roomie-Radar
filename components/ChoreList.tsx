"use client";

import { useState } from "react";
import { ChoreCard } from "./ChoreCard";
import { CreateChoreModal } from "./CreateChoreModal";
import { Plus } from "lucide-react";

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

interface ChoreListProps {
  chores: Chore[];
  householdCode: string;
  currentMemberId: string | null;
  members: Member[];
  onUpdate?: () => void;
}

export function ChoreList({
  chores,
  householdCode,
  currentMemberId,
  members,
  onUpdate,
}: ChoreListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!currentMemberId) {
    return (
      <div className="text-center py-8 text-slate-500">
        Please join this household to view chores.
      </div>
    );
  }

  const activeChores = chores.filter((c) => c.isActive);
  const inactiveChores = chores.filter((c) => !c.isActive);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">Chores</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-600 transition-colors"
        >
          <Plus size={18} />
          New Chore
        </button>
      </div>

      {activeChores.length > 0 ? (
        <div className="space-y-3 mb-6">
          {activeChores.map((chore) => (
            <ChoreCard
              key={chore.id}
              chore={chore}
              currentMemberId={currentMemberId}
              members={members}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg border border-slate-200 text-slate-500 mb-6">
          No active chores. Create one to get started!
        </div>
      )}

      {inactiveChores.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-slate-600 mb-3">Inactive Chores</h3>
          <div className="space-y-3">
            {inactiveChores.map((chore) => (
              <ChoreCard
                key={chore.id}
                chore={chore}
                currentMemberId={currentMemberId}
                members={members}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </div>
      )}

      <CreateChoreModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        householdCode={householdCode}
        createdById={currentMemberId}
        members={members}
        onSuccess={onUpdate}
      />
    </div>
  );
}


