"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { HouseholdHeader } from "@/components/HouseholdHeader";
import { ChoreList } from "@/components/ChoreList";
import { getLocalMemberId } from "@/lib/member-storage";

type MemberForChoreList = {
  id: string;
  name: string;
  emoji: string | null;
  colorHex: string;
};

interface Household {
  id: string;
  name: string;
  code: string;
  members: Array<{
    id: string;
    name: string;
    emoji: string | null;
    colorHex: string;
    [key: string]: any; // Allow additional properties from API
  }>;
}

export default function ChoresPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [household, setHousehold] = useState<Household | null>(null);
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
  const [currentMember, setCurrentMember] = useState<Household["members"][0] | null>(null);
  const [chores, setChores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [code]);

  const loadData = async () => {
    try {
      // Load household
      const householdRes = await fetch(`/api/households/${code}`);
      if (!householdRes.ok) {
        router.push("/");
        return;
      }
      const householdData = await householdRes.json();
      setHousehold(householdData);

      // Get current member
      const memberId = getLocalMemberId(code);
      if (memberId) {
        setCurrentMemberId(memberId);
        const member = householdData.members.find((m: Household["members"][0]) => m.id === memberId);
        setCurrentMember(member || null);
      }

      // Load chores
      const choresRes = await fetch(`/api/chores?householdCode=${code}`);
      if (choresRes.ok) {
        const choresData = await choresRes.json();
        setChores(choresData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!household) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <HouseholdHeader
        householdName={household.name}
        householdCode={code}
        currentMember={currentMember}
      />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <ChoreList
          chores={chores}
          householdCode={code}
          currentMemberId={currentMemberId}
          members={household.members as MemberForChoreList[]}
          onUpdate={loadData}
        />
      </main>
    </div>
  );
}


