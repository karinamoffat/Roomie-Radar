"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface PollResult {
  option: string;
  index: number;
  votes: number;
  percentage: number;
}

interface Member {
  id: string;
  name: string;
  colorHex: string;
  emoji: string | null;
}

interface PollResultsProps {
  pollId: string;
  members: Member[];
}

export function PollResults({ pollId, members }: PollResultsProps) {
  const [results, setResults] = useState<PollResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [voters, setVoters] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [pollId]);

  const loadResults = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/polls/${pollId}/results`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setTotalVotes(data.totalVotes || 0);
        setVoters(data.voters || []);
      }
    } catch (error) {
      console.error("Error loading poll results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4 text-slate-500">Loading results...</div>;
  }

  const maxVotes = Math.max(...results.map((r) => r.votes), 1);

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600">
        {totalVotes} {totalVotes === 1 ? "vote" : "votes"} • {voters.length} of {members.length} {members.length === 1 ? "member" : "members"} voted
      </div>

      <div className="space-y-3">
        {results.map((result) => (
          <div key={result.index}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-900">{result.option}</span>
              <span className="text-sm text-slate-600">
                {result.votes} {result.votes === 1 ? "vote" : "votes"} ({result.percentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-indigo-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(result.votes / maxVotes) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {voters.length > 0 && (
        <div className="pt-4 border-t border-slate-200">
          <div className="text-xs font-medium text-slate-600 mb-2">Voted:</div>
          <div className="flex flex-wrap gap-2">
            {voters.map((voter) => (
              <div key={voter.id} className="flex items-center gap-1 text-sm">
                <span>{voter.emoji}</span>
                <span>{voter.name}</span>
                <CheckCircle2 size={12} className="text-emerald-600" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


