"use client";

import { useState } from "react";
import { Dialog } from "./Dialog";
import { PartyPopper, Clapperboard, BookOpen, Plane, Briefcase } from "lucide-react";

interface CreateStatusModalProps {
  open: boolean;
  onClose: () => void;
  memberId: string;
  onSuccess?: () => void;
}

const statusPresets = [
  {
    label: "Going out tonight",
    category: "going_out",
    icon: <PartyPopper size={20} />,
    forTonight: true,
  },
  {
    label: "Watching a movie",
    category: "chilling",
    icon: <Clapperboard size={20} />,
    forTonight: false,
  },
  {
    label: "Studying",
    category: "studying",
    icon: <BookOpen size={20} />,
    forTonight: false,
  },
  {
    label: "Working late",
    category: "working",
    icon: <Briefcase size={20} />,
    forTonight: false,
  },
  {
    label: "Away for the weekend",
    category: "away",
    icon: <Plane size={20} />,
    forTonight: false,
  },
];

export function CreateStatusModal({
  open,
  onClose,
  memberId,
  onSuccess,
}: CreateStatusModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customLabel, setCustomLabel] = useState("");
  const [customForTonight, setCustomForTonight] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    let statusData;
    if (selectedPreset === "custom") {
      if (!customLabel.trim()) {
        setIsSubmitting(false);
        return;
      }
      statusData = {
        memberId,
        label: customLabel.trim(),
        category: "custom",
        forTonight: customForTonight,
      };
    } else {
      const preset = statusPresets.find((p) => p.label === selectedPreset);
      if (!preset) {
        setIsSubmitting(false);
        return;
      }
      statusData = {
        memberId,
        label: preset.label,
        category: preset.category,
        forTonight: preset.forTonight,
      };
    }

    try {
      const response = await fetch("/api/statuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(statusData),
      });

      if (response.ok) {
        onSuccess?.();
        onClose();
        setSelectedPreset(null);
        setCustomLabel("");
        setCustomForTonight(false);
      }
    } catch (error) {
      console.error("Error creating status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Update Status">
      <div className="space-y-3">
        {statusPresets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => setSelectedPreset(preset.label)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all hover:border-indigo-300 ${
              selectedPreset === preset.label
                ? "border-indigo-500 bg-indigo-50"
                : "border-slate-200 bg-white"
            }`}
          >
            {preset.icon}
            <span className="font-medium text-slate-900">{preset.label}</span>
          </button>
        ))}

        <button
          onClick={() => setSelectedPreset("custom")}
          className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all hover:border-indigo-300 ${
            selectedPreset === "custom"
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <span className="font-medium text-slate-900">Custom</span>
        </button>

        {selectedPreset === "custom" && (
          <div className="space-y-3 pt-2">
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Enter custom status"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={customForTonight}
                onChange={(e) => setCustomForTonight(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">This is for tonight</span>
            </label>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedPreset}
          className="w-full mt-4 bg-indigo-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Updating..." : "Update Status"}
        </button>
      </div>
    </Dialog>
  );
}
