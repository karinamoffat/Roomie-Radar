"use client";

import { useState } from "react";
import { Dialog } from "./Dialog";
import { useRouter } from "next/navigation";

interface CreateHouseModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateHouseModal({ open, onClose }: CreateHouseModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("House name is required");
      return;
    }

    // Validate code format (e.g., no spaces, reasonable length)
    const trimmedName = name.trim().toUpperCase();
    if (trimmedName.length < 3 || trimmedName.length > 20) {
      setError("House code must be between 3 and 20 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      // First check if household already exists
      try {
        const checkResponse = await fetch(`/api/households/${trimmedName}`);
        if (checkResponse.ok) {
          setError("This house name already exists. Please choose a different name or join an existing houseabove.");
          setIsSubmitting(false);
          return;
        }
        // If 404, that's fine - the house doesn't exist yet
      } catch (checkErr) {
        // If check fails for network reasons, we'll still try to create
        // and handle the error there
      }

      // Create new household
      const response = await fetch("/api/households", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: trimmedName,
          name: name.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create household");
      }

      // Success - navigate to the house page
      router.push(`/house/${trimmedName}`);
    } catch (err: any) {
      setError(err.message || "Failed to create household. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName("");
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} title="Create New House" className="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            House Code *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value.toUpperCase());
              setError("");
            }}
            placeholder="e.g., FunHouse!"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
            disabled={isSubmitting}
            maxLength={20}
          />
          <p className="text-xs text-slate-500 mt-1">
            Choose a unique name that your housemates can use to join (3-20 characters)
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="w-full bg-indigo-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting ? "Creating..." : "Create House"}
        </button>
      </form>
    </Dialog>
  );
}

