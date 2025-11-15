"use client";

import { useState } from "react";
import { ShoppingCart, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface GroceryRequest {
  id: string;
  item: string;
  requestedBy: string;
  isDone: boolean;
}

interface Member {
  id: string;
  name: string;
  emoji?: string | null;
}

interface GroceryTrip {
  id: string;
  storeName: string;
  leavingAt?: Date | string | null;
  note?: string | null;
  takingRequests: boolean;
  member: Member;
  requests: GroceryRequest[];
}

interface GroceryTripCardProps {
  trip: GroceryTrip;
  isOwner: boolean;
  currentMemberName: string;
  onUpdate?: () => void;
}

export function GroceryTripCard({
  trip,
  isOwner,
  currentMemberName,
  onUpdate,
}: GroceryTripCardProps) {
  const [newRequest, setNewRequest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.trim() || !trip.takingRequests) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/groceries/${trip.id}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestedBy: currentMemberName,
          item: newRequest.trim(),
        }),
      });

      if (response.ok) {
        setNewRequest("");
        onUpdate?.();
      }
    } catch (error) {
      console.error("Error adding request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkDone = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/groceries/${trip.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });

      if (response.ok) {
        onUpdate?.();
      }
    } catch (error) {
      console.error("Error marking trip done:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="text-emerald-600" size={20} />
          <div>
            <div className="font-medium text-slate-900">
              {trip.member.emoji} {trip.member.name}
            </div>
            <div className="text-sm text-slate-600">{trip.storeName}</div>
          </div>
        </div>
        {trip.leavingAt && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock size={14} />
            <span>{format(new Date(trip.leavingAt), "h:mm a")}</span>
          </div>
        )}
      </div>

      {trip.note && (
        <div className="text-sm text-slate-600 mb-3 italic">{trip.note}</div>
      )}

      {trip.requests.length > 0 && (
        <div className="mb-3 space-y-1">
          <div className="text-xs font-medium text-slate-500 mb-1">
            Requests:
          </div>
          {trip.requests.map((request) => (
            <div
              key={request.id}
              className="flex items-start gap-2 text-sm text-slate-700"
            >
              <CheckCircle2 size={14} className="mt-0.5 text-slate-400" />
              <span className="flex-1">
                {request.item}{" "}
                <span className="text-xs text-slate-500">
                  by {request.requestedBy}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}

      {trip.takingRequests && !isOwner && (
        <form onSubmit={handleAddRequest} className="flex gap-2">
          <input
            type="text"
            value={newRequest}
            onChange={(e) => setNewRequest(e.target.value)}
            placeholder="Add a request"
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newRequest.trim()}
            className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </form>
      )}

      {isOwner && (
        <button
          onClick={handleMarkDone}
          disabled={isSubmitting}
          className="w-full mt-3 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Mark Done
        </button>
      )}
    </div>
  );
}
