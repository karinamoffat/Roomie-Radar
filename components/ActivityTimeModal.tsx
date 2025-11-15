"use client";

import { useState } from "react";
import { Dialog } from "./Dialog";
import { Clock } from "lucide-react";

interface ActivityTimeModalProps {
  open: boolean;
  onClose: () => void;
  activityName: string;
  onSubmit: (time: Date | null) => void;
}

export function ActivityTimeModal({
  open,
  onClose,
  activityName,
  onSubmit,
}: ActivityTimeModalProps) {
  const [selectedOption, setSelectedOption] = useState<string>("one_hour");
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let selectedTime: Date | null = null;

    if (selectedOption === "one_hour") {
      selectedTime = new Date();
      selectedTime.setHours(selectedTime.getHours() + 1);
    } else if (selectedOption === "two_hours") {
      selectedTime = new Date();
      selectedTime.setHours(selectedTime.getHours() + 2);
    } else if (selectedOption === "tomorrow") {
      selectedTime = new Date();
      selectedTime.setDate(selectedTime.getDate() + 1);
      selectedTime.setHours(9, 0, 0, 0); // Default to 9 AM tomorrow
    } else if (selectedOption === "custom") {
      if (customDate && customTime) {
        selectedTime = new Date(`${customDate}T${customTime}`);
      }
    }

    onSubmit(selectedTime);
    onClose();
  };

  const handleCancel = () => {
    // If canceling, submit null to deactivate the activity
    onSubmit(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="text-indigo-600" size={24} />
          <h2 className="text-xl font-semibold text-slate-900">
            When are you going?
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Time options */}
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="timeOption"
                value="one_hour"
                checked={selectedOption === "one_hour"}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="text-slate-700 font-medium">In 1 hour</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="timeOption"
                value="two_hours"
                checked={selectedOption === "two_hours"}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="text-slate-700 font-medium">In 2 hours</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="timeOption"
                value="tomorrow"
                checked={selectedOption === "tomorrow"}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="text-slate-700 font-medium">Tomorrow (9 AM)</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="timeOption"
                value="custom"
                checked={selectedOption === "custom"}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="text-slate-700 font-medium">Custom time</span>
            </label>
          </div>

          {/* Custom time inputs */}
          {selectedOption === "custom" && (
            <div className="pl-7 space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required={selectedOption === "custom"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required={selectedOption === "custom"}
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2.5 rounded-lg border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
