"use client";

import { useState } from "react";
import { Dialog } from "./Dialog";
import { Plus, X } from "lucide-react";

interface CreatePollModalProps {
  open: boolean;
  onClose: () => void;
  householdCode: string;
  createdByMemberId: string;
  onSuccess?: () => void;
}

export function CreatePollModal({
  open,
  onClose,
  householdCode,
  createdByMemberId,
  onSuccess,
}: CreatePollModalProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validOptions = options.filter((opt) => opt.trim());
    if (!question.trim() || validOptions.length < 2) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          householdCode,
          question: question.trim(),
          options: validOptions.map((opt) => opt.trim()),
          allowMultiple,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          createdByMemberId,
        }),
      });

      if (response.ok) {
        onSuccess?.();
        onClose();
        setQuestion("");
        setOptions(["", ""]);
        setAllowMultiple(false);
        setExpiresAt("");
      }
    } catch (error) {
      console.error("Error creating poll:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validOptionsCount = options.filter((opt) => opt.trim()).length;

  return (
    <Dialog open={open} onClose={onClose} title="Create Poll" className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Question *
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., What movie should we watch tonight?"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Options * (at least 2 required)
          </label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddOption}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Plus size={16} />
              Add Option
            </button>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allowMultiple}
              onChange={(e) => setAllowMultiple(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700">
              Allow multiple selections
            </span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Expires At (optional)
          </label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !question.trim() || validOptionsCount < 2}
          className="w-full bg-indigo-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : "Create Poll"}
        </button>
      </form>
    </Dialog>
  );
}


