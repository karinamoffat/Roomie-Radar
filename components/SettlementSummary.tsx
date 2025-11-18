"use client";

import { useEffect, useState } from "react";
import { Dialog } from "./Dialog";
import { ArrowRight } from "lucide-react";

interface Member {
  id: string;
  name: string;
  colorHex: string;
  emoji: string | null;
}

interface Settlement {
  from: Member;
  to: Member;
  amount: number;
}

interface SettlementSummaryProps {
  open: boolean;
  onClose: () => void;
  householdCode: string;
  members: Member[];
}

export function SettlementSummary({
  open,
  onClose,
  householdCode,
  members,
}: SettlementSummaryProps) {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadSettlements();
    }
  }, [open, householdCode]);

  const loadSettlements = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/expenses/settlements?householdCode=${householdCode}`);
      if (response.ok) {
        const data = await response.json();
        setSettlements(data.settlements || []);
        setBalances(data.balances || {});
      }
    } catch (error) {
      console.error("Error loading settlements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const memberMap = new Map(members.map((m) => [m.id, m]));

  return (
    <Dialog open={open} onClose={onClose} title="Settlement Summary" className="max-w-2xl">
      {isLoading ? (
        <div className="text-center py-8 text-slate-500">Loading...</div>
      ) : settlements.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          All expenses are settled! No one owes anyone.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {settlements.map((settlement, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{settlement.from.emoji}</span>
                    <span className="font-medium text-slate-900">{settlement.from.name}</span>
                  </div>
                  <ArrowRight size={16} className="text-slate-400" />
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{settlement.to.emoji}</span>
                    <span className="font-medium text-slate-900">{settlement.to.name}</span>
                  </div>
                </div>
                <div className="text-lg font-semibold text-indigo-600">
                  ${settlement.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {Object.keys(balances).length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Current Balances</h3>
              <div className="space-y-2">
                {Object.entries(balances).map(([memberId, balance]) => {
                  const member = memberMap.get(memberId);
                  if (!member) return null;
                  
                  return (
                    <div
                      key={memberId}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span>{member.emoji}</span>
                        <span>{member.name}</span>
                      </div>
                      <span
                        className={
                          balance > 0
                            ? "text-emerald-600 font-medium"
                            : balance < 0
                            ? "text-red-600 font-medium"
                            : "text-slate-600"
                        }
                      >
                        {balance > 0 ? "+" : ""}${balance.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}


