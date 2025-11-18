"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Wrench, AlertCircle, CheckCircle2, Clock, Trash2 } from "lucide-react";

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

interface MaintenanceCardProps {
  issue: MaintenanceIssue;
  currentMemberId: string | null;
  onUpdate?: () => void;
}

const categoryLabels: Record<string, string> = {
  plumbing: "Plumbing",
  electrical: "Electrical",
  appliance: "Appliance",
  heating: "Heating/Cooling",
  other: "Other",
};

const priorityColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

const statusColors: Record<string, string> = {
  reported: "bg-slate-100 text-slate-700",
  "in-progress": "bg-blue-100 text-blue-700",
  resolved: "bg-emerald-100 text-emerald-700",
};

export function MaintenanceCard({ issue, currentMemberId, onUpdate }: MaintenanceCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/maintenance/${issue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onUpdate?.();
      }
    } catch (error) {
      console.error("Error updating issue:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this maintenance issue?")) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/maintenance/${issue.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onUpdate?.();
      }
    } catch (error) {
      console.error("Error deleting issue:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg border p-4 ${
      issue.priority === "high" && issue.status !== "resolved"
        ? "border-red-200"
        : "border-slate-200"
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900">{issue.title}</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[issue.priority]}`}>
              {issue.priority}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[issue.status]}`}>
              {issue.status}
            </span>
          </div>
          {issue.description && (
            <p className="text-sm text-slate-600 mt-1">{issue.description}</p>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="p-1.5 hover:bg-slate-100 rounded transition-colors"
          title="Delete"
        >
          <Trash2 size={16} className="text-red-600" />
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
        <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">
          {categoryLabels[issue.category] || issue.category}
        </span>
        <span className="flex items-center gap-1">
          <span>Reported by: {issue.reportedBy.emoji} {issue.reportedBy.name}</span>
        </span>
        <span className="text-slate-400">•</span>
        <span>{format(new Date(issue.reportedAt), "MMM d, yyyy")}</span>
      </div>

      {issue.resolvedAt && (
        <div className="text-sm text-emerald-600 mb-3">
          Resolved: {format(new Date(issue.resolvedAt), "MMM d, yyyy")}
        </div>
      )}

      {issue.status !== "resolved" && (
        <div className="flex gap-2">
          {issue.status === "reported" && (
            <button
              onClick={() => handleStatusUpdate("in-progress")}
              disabled={isUpdating}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 text-sm"
            >
              <Clock size={16} />
              Mark In Progress
            </button>
          )}
          {issue.status === "in-progress" && (
            <button
              onClick={() => handleStatusUpdate("resolved")}
              disabled={isUpdating}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 text-sm"
            >
              <CheckCircle2 size={16} />
              Mark Resolved
            </button>
          )}
          {issue.status === "reported" && (
            <button
              onClick={() => handleStatusUpdate("resolved")}
              disabled={isUpdating}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 text-sm"
            >
              <CheckCircle2 size={16} className="inline mr-2" />
              Resolve
            </button>
          )}
        </div>
      )}

      {issue.status === "resolved" && (
        <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
          <CheckCircle2 size={16} />
          Resolved
        </div>
      )}
    </div>
  );
}


