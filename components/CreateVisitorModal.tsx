"use client";

import { useState } from "react";
import { Dialog } from "./Dialog";

interface CreateVisitorModalProps {
  open: boolean;
  onClose: () => void;
  householdCode: string;
  hostMemberId: string;
  members: Array<{ id: string; name: string; colorHex: string; emoji: string | null }>;
  onSuccess?: () => void;
}

export function CreateVisitorModal({
  open,
  onClose,
  householdCode,
  hostMemberId,
  members,
  onSuccess,
}: CreateVisitorModalProps) {
  const [visitorName, setVisitorName] = useState("");
  const [selectedHostId, setSelectedHostId] = useState(hostMemberId);
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split("T")[0]);
  const [checkInTime, setCheckInTime] = useState(new Date().toTimeString().slice(0, 5));
  const [checkOutDate, setCheckOutDate] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!visitorName.trim() || !selectedHostId) {
      return;
    }

    setIsSubmitting(true);

    try {
      const checkInDateTime = checkInDate && checkInTime
        ? new Date(`${checkInDate}T${checkInTime}`).toISOString()
        : new Date().toISOString();

      const checkOutDateTime = checkOutDate && checkOutTime
        ? new Date(`${checkOutDate}T${checkOutTime}`).toISOString()
        : null;

      const response = await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          householdCode,
          visitorName: visitorName.trim(),
          hostMemberId: selectedHostId,
          checkInDate: checkInDateTime,
          checkOutDate: checkOutDateTime,
          notes: notes.trim() || null,
        }),
      });

      if (response.ok) {
        onSuccess?.();
        onClose();
        setVisitorName("");
        setSelectedHostId(hostMemberId);
        setCheckInDate(new Date().toISOString().split("T")[0]);
        setCheckInTime(new Date().toTimeString().slice(0, 5));
        setCheckOutDate("");
        setCheckOutTime("");
        setNotes("");
      }
    } catch (error) {
      console.error("Error creating visitor:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Add Visitor" className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Visitor Name *
          </label>
          <input
            type="text"
            value={visitorName}
            onChange={(e) => setVisitorName(e.target.value)}
            placeholder="e.g., Sarah, John"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Host *
          </label>
          <select
            value={selectedHostId}
            onChange={(e) => setSelectedHostId(e.target.value)}
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Check-in Date
            </label>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Check-in Time
            </label>
            <input
              type="time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Check-out Date (optional)
            </label>
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Check-out Time (optional)
            </label>
            <input
              type="time"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional information..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !visitorName.trim() || !selectedHostId}
          className="w-full bg-indigo-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Adding..." : "Add Visitor"}
        </button>
      </form>
    </Dialog>
  );
}


