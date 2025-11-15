"use client";

import { useState } from "react";
import { Dialog } from "./Dialog";

interface CreateGroceryTripModalProps {
  open: boolean;
  onClose: () => void;
  memberId: string;
  onSuccess?: () => void;
}

const storeNames = [
  "Loblaws",
  "No Frills",
  "Walmart",
  "Metro",
  "Sobeys",
  "FreshCo",
];

const leavingInOptions = [
  { label: "Now", minutes: 0 },
  { label: "In 15 minutes", minutes: 15 },
  { label: "In 30 minutes", minutes: 30 },
  { label: "In 1 hour", minutes: 60 },
];

export function CreateGroceryTripModal({
  open,
  onClose,
  memberId,
  onSuccess,
}: CreateGroceryTripModalProps) {
  const [storeName, setStoreName] = useState("");
  const [customStore, setCustomStore] = useState("");
  const [leavingInMinutes, setLeavingInMinutes] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [takingRequests, setTakingRequests] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalStoreName = storeName === "custom" ? customStore.trim() : storeName;

    if (!finalStoreName) {
      return;
    }

    setIsSubmitting(true);

    const leavingAt = leavingInMinutes !== null
      ? new Date(Date.now() + leavingInMinutes * 60000).toISOString()
      : null;

    try {
      const response = await fetch("/api/groceries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          storeName: finalStoreName,
          leavingAt,
          note: note.trim() || null,
          takingRequests,
        }),
      });

      if (response.ok) {
        onSuccess?.();
        onClose();
        // Reset form
        setStoreName("");
        setCustomStore("");
        setLeavingInMinutes(null);
        setNote("");
        setTakingRequests(true);
      }
    } catch (error) {
      console.error("Error creating grocery trip:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Grocery Shopping Trip">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Store *
          </label>
          <select
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required={!customStore}
          >
            <option value="">Select a store</option>
            {storeNames.map((store) => (
              <option key={store} value={store}>
                {store}
              </option>
            ))}
            <option value="custom">Other (enter below)</option>
          </select>
        </div>

        {storeName === "custom" && (
          <div>
            <input
              type="text"
              value={customStore}
              onChange={(e) => setCustomStore(e.target.value)}
              placeholder="Enter store name"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Leaving
          </label>
          <select
            value={leavingInMinutes === null ? "" : leavingInMinutes}
            onChange={(e) =>
              setLeavingInMinutes(
                e.target.value === "" ? null : parseInt(e.target.value)
              )
            }
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Not specified</option>
            {leavingInOptions.map((option) => (
              <option key={option.minutes} value={option.minutes}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., Going now, Can grab heavy items"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={takingRequests}
              onChange={(e) => setTakingRequests(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700">Taking requests</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={
            isSubmitting ||
            (storeName !== "custom" && !storeName) ||
            (storeName === "custom" && !customStore.trim())
          }
          className="w-full bg-emerald-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : "Start Trip"}
        </button>
      </form>
    </Dialog>
  );
}
