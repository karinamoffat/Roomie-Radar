"use client";

import { useState } from "react";
import { format } from "date-fns";
import { User, Calendar, CheckCircle2, LogOut, Trash2 } from "lucide-react";

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

interface VisitorCardProps {
  visitor: Visitor;
  currentMemberId: string | null;
  onUpdate?: () => void;
}

export function VisitorCard({ visitor, currentMemberId, onUpdate }: VisitorCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const isCurrent = !visitor.checkOutDate;
  const isMyGuest = visitor.host.id === currentMemberId;

  const handleCheckOut = async () => {
    if (!confirm(`Check out ${visitor.visitorName}?`)) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/visitors/${visitor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkOutDate: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        onUpdate?.();
      }
    } catch (error) {
      console.error("Error checking out visitor:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this visitor record?")) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/visitors/${visitor.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onUpdate?.();
      }
    } catch (error) {
      console.error("Error deleting visitor:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg border p-4 ${isCurrent ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200"}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <User size={18} className="text-slate-600" />
            <h3 className="font-semibold text-slate-900">{visitor.visitorName}</h3>
            {isCurrent && (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                Current
              </span>
            )}
          </div>
          <div className="text-sm text-slate-600">
            Host: {visitor.host.emoji} {visitor.host.name}
          </div>
        </div>
        {isMyGuest && (
          <button
            onClick={handleDelete}
            className="p-1.5 hover:bg-slate-100 rounded transition-colors"
            title="Delete"
          >
            <Trash2 size={16} className="text-red-600" />
          </button>
        )}
      </div>

      <div className="space-y-1 text-sm text-slate-600 mb-3">
        <div className="flex items-center gap-2">
          <Calendar size={14} />
          <span>Check-in: {format(new Date(visitor.checkInDate), "MMM d, yyyy 'at' h:mm a")}</span>
        </div>
        {visitor.checkOutDate && (
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} />
            <span>Check-out: {format(new Date(visitor.checkOutDate), "MMM d, yyyy 'at' h:mm a")}</span>
          </div>
        )}
      </div>

      {visitor.notes && (
        <div className="text-sm text-slate-600 mb-3 italic bg-slate-50 p-2 rounded">
          {visitor.notes}
        </div>
      )}

      {isCurrent && isMyGuest && (
        <button
          onClick={handleCheckOut}
          disabled={isUpdating}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 text-sm"
        >
          <LogOut size={16} />
          Check Out
        </button>
      )}
    </div>
  );
}


