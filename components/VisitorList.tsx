"use client";

import { useState } from "react";
import { VisitorCard } from "./VisitorCard";
import { CreateVisitorModal } from "./CreateVisitorModal";
import { Plus } from "lucide-react";

interface Member {
  id: string;
  name: string;
  colorHex: string;
  emoji: string | null;
}

interface Visitor {
  id: string;
  visitorName: string;
  host: Member;
  checkInDate: Date | string;
  checkOutDate: Date | string | null;
  notes: string | null;
}

interface VisitorListProps {
  visitors: Visitor[];
  householdCode: string;
  currentMemberId: string | null;
  members: Member[];
  onUpdate?: () => void;
}

export function VisitorList({
  visitors,
  householdCode,
  currentMemberId,
  members,
  onUpdate,
}: VisitorListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!currentMemberId) {
    return (
      <div className="text-center py-8 text-slate-500">
        Please join this household to view visitors.
      </div>
    );
  }

  const currentVisitors = visitors.filter((v) => !v.checkOutDate);
  const pastVisitors = visitors.filter((v) => v.checkOutDate);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">Visitors</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-600 transition-colors"
        >
          <Plus size={18} />
          Add Visitor
        </button>
      </div>

      {currentVisitors.length > 0 ? (
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Current Visitors</h3>
          {currentVisitors.map((visitor) => (
            <VisitorCard
              key={visitor.id}
              visitor={visitor}
              currentMemberId={currentMemberId}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg border border-slate-200 text-slate-500 mb-6">
          No current visitors.
        </div>
      )}

      {pastVisitors.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-slate-600 mb-3">Past Visitors</h3>
          <div className="space-y-3">
            {pastVisitors.map((visitor) => (
              <VisitorCard
                key={visitor.id}
                visitor={visitor}
                currentMemberId={currentMemberId}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </div>
      )}

      <CreateVisitorModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        householdCode={householdCode}
        hostMemberId={currentMemberId}
        members={members}
        onSuccess={onUpdate}
      />
    </div>
  );
}


