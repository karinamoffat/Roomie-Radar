"use client";

import { useState } from "react";
import { PollCard } from "./PollCard";
import { CreatePollModal } from "./CreatePollModal";
import { Plus } from "lucide-react";

interface Member {
  id: string;
  name: string;
  colorHex: string;
  emoji: string | null;
}

interface PollResponse {
  memberId: string;
  member: Member;
  selectedOptions: string;
}

interface Poll {
  id: string;
  question: string;
  options: string;
  allowMultiple: boolean;
  expiresAt: Date | string | null;
  createdBy: Member;
  createdAt: Date | string;
  responses: PollResponse[];
}

interface PollListProps {
  polls: Poll[];
  householdCode: string;
  currentMemberId: string | null;
  members: Member[];
  onUpdate?: () => void;
}

export function PollList({
  polls,
  householdCode,
  currentMemberId,
  members,
  onUpdate,
}: PollListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!currentMemberId) {
    return (
      <div className="text-center py-8 text-slate-500">
        Please join this household to view polls.
      </div>
    );
  }

  const activePolls = polls.filter((p) => {
    if (!p.expiresAt) return true;
    return new Date(p.expiresAt) >= new Date();
  });

  const expiredPolls = polls.filter((p) => {
    if (!p.expiresAt) return false;
    return new Date(p.expiresAt) < new Date();
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">Polls</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-600 transition-colors"
        >
          <Plus size={18} />
          New Poll
        </button>
      </div>

      {activePolls.length > 0 ? (
        <div className="space-y-3 mb-6">
          {activePolls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              currentMemberId={currentMemberId}
              members={members}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg border border-slate-200 text-slate-500 mb-6">
          No active polls. Create one to get started!
        </div>
      )}

      {expiredPolls.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-slate-600 mb-3">Expired Polls</h3>
          <div className="space-y-3">
            {expiredPolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                currentMemberId={currentMemberId}
                members={members}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </div>
      )}

      <CreatePollModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        householdCode={householdCode}
        createdByMemberId={currentMemberId}
        onSuccess={onUpdate}
      />
    </div>
  );
}


