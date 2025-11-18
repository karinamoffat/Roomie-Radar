"use client";

import { useState } from "react";
import { MaintenanceCard } from "./MaintenanceCard";
import { CreateMaintenanceModal } from "./CreateMaintenanceModal";
import { Plus } from "lucide-react";

interface Member {
  id: string;
  name: string;
  colorHex: string;
  emoji: string | null;
}

interface MaintenanceIssue {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  priority: string;
  reportedBy: Member;
  reportedAt: Date | string;
  resolvedAt: Date | string | null;
}

interface MaintenanceListProps {
  issues: MaintenanceIssue[];
  householdCode: string;
  currentMemberId: string | null;
  onUpdate?: () => void;
}

export function MaintenanceList({
  issues,
  householdCode,
  currentMemberId,
  onUpdate,
}: MaintenanceListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!currentMemberId) {
    return (
      <div className="text-center py-8 text-slate-500">
        Please join this household to view maintenance issues.
      </div>
    );
  }

  const activeIssues = issues.filter((i) => i.status !== "resolved");
  const resolvedIssues = issues.filter((i) => i.status === "resolved");

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">Maintenance Issues</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-600 transition-colors"
        >
          <Plus size={18} />
          Report Issue
        </button>
      </div>

      {activeIssues.length > 0 ? (
        <div className="space-y-3 mb-6">
          {activeIssues.map((issue) => (
            <MaintenanceCard
              key={issue.id}
              issue={issue}
              currentMemberId={currentMemberId}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg border border-slate-200 text-slate-500 mb-6">
          No active maintenance issues!
        </div>
      )}

      {resolvedIssues.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-slate-600 mb-3">Resolved Issues</h3>
          <div className="space-y-3">
            {resolvedIssues.map((issue) => (
              <MaintenanceCard
                key={issue.id}
                issue={issue}
                currentMemberId={currentMemberId}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </div>
      )}

      <CreateMaintenanceModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        householdCode={householdCode}
        reportedByMemberId={currentMemberId}
        onSuccess={onUpdate}
      />
    </div>
  );
}


