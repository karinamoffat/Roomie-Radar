"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { PollResults } from "./PollResults";
import { CheckCircle2, XCircle, Users } from "lucide-react";

interface Member {
  id: string;
  name: string;
  colorHex: string;
  emoji: string | null;
}

interface PollResponse {
  memberId: string;
  member: Member;
  selectedOptions: string;
}

interface Poll {
  id: string;
  question: string;
  options: string; // JSON array
  allowMultiple: boolean;
  expiresAt: Date | string | null;
  createdBy: Member;
  createdAt: Date | string;
  responses: PollResponse[];
}

interface PollCardProps {
  poll: Poll;
  currentMemberId: string | null;
  members: Member[];
  onUpdate?: () => void;
}

export function PollCard({ poll, currentMemberId, members, onUpdate }: PollCardProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const options = JSON.parse(poll.options);
  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
  const userResponse = poll.responses.find((r) => r.memberId === currentMemberId);

  useEffect(() => {
    if (userResponse) {
      setHasVoted(true);
      setShowResults(true);
      setSelectedIndices(JSON.parse(userResponse.selectedOptions));
    }
  }, [userResponse]);

  const handleOptionToggle = (index: number) => {
    if (isExpired || hasVoted) return;

    if (poll.allowMultiple) {
      if (selectedIndices.includes(index)) {
        setSelectedIndices(selectedIndices.filter((i) => i !== index));
      } else {
        setSelectedIndices([...selectedIndices, index]);
      }
    } else {
      setSelectedIndices([index]);
    }
  };

  const handleVote = async () => {
    if (selectedIndices.length === 0 || isExpired || hasVoted || !currentMemberId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: currentMemberId,
          selectedOptions: selectedIndices,
        }),
      });

      if (response.ok) {
        setHasVoted(true);
        setShowResults(true);
        onUpdate?.();
      }
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="mb-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-slate-900 flex-1">{poll.question}</h3>
          {isExpired && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs ml-2">
              Expired
            </span>
          )}
        </div>
        <div className="text-xs text-slate-500">
          Created by {poll.createdBy.emoji} {poll.createdBy.name}
          {poll.expiresAt && !isExpired && (
            <> • Expires: {format(new Date(poll.expiresAt), "MMM d, h:mm a")}</>
          )}
        </div>
      </div>

      {!showResults ? (
        <div className="space-y-2 mb-3">
          {options.map((option: string, index: number) => (
            <button
              key={index}
              onClick={() => handleOptionToggle(index)}
              disabled={isExpired || hasVoted}
              className={`w-full text-left px-4 py-2 rounded-lg border transition-all ${
                selectedIndices.includes(index)
                  ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                  : "border-slate-200 hover:border-slate-300 text-slate-700"
              } ${isExpired || hasVoted ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <PollResults pollId={poll.id} members={members} />
      )}

      {!hasVoted && !isExpired && currentMemberId && (
        <button
          onClick={handleVote}
          disabled={isSubmitting || selectedIndices.length === 0}
          className="w-full bg-indigo-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm mb-2"
        >
          {isSubmitting ? "Submitting..." : "Submit Vote"}
        </button>
      )}

      {!showResults && poll.responses.length > 0 && (
        <button
          onClick={() => setShowResults(true)}
          className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium py-2"
        >
          View Results ({poll.responses.length} {poll.responses.length === 1 ? "vote" : "votes"})
        </button>
      )}

      {showResults && !hasVoted && !isExpired && (
        <button
          onClick={() => setShowResults(false)}
          className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium py-2"
        >
          Vote
        </button>
      )}
    </div>
  );
}

