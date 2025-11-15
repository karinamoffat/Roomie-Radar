"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { HouseholdHeader } from "@/components/HouseholdHeader";
import { getLocalMemberId } from "@/lib/member-storage";
import { Save } from "lucide-react";

interface Member {
  id: string;
  name: string;
  colorHex: string;
  emoji?: string | null;
}

interface Household {
  id: string;
  name: string;
  code: string;
}

const availableColors = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#ef4444", // red
  "#06b6d4", // cyan
];

const availableEmojis = ["😊", "🎮", "📚", "🎵", "🏃", "🎨", "🍕", "⚡"];

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [household, setHousehold] = useState<Household | null>(null);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [householdName, setHouseholdName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberColor, setMemberColor] = useState(availableColors[0]);
  const [memberEmoji, setMemberEmoji] = useState(availableEmojis[0]);

  const [isSavingHousehold, setIsSavingHousehold] = useState(false);
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadData();
  }, [code]);

  const loadData = async () => {
    try {
      const response = await fetch(`/api/households/${code}`);
      if (!response.ok) {
        router.push("/");
        return;
      }

      const data = await response.json();
      setHousehold(data);
      setHouseholdName(data.name);

      const memberId = getLocalMemberId(code);
      if (memberId) {
        const member = data.members.find((m: Member) => m.id === memberId);
        if (member) {
          setCurrentMember(member);
          setMemberName(member.name);
          setMemberColor(member.colorHex);
          setMemberEmoji(member.emoji || availableEmojis[0]);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdName.trim()) return;

    setIsSavingHousehold(true);
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/households/${code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: householdName.trim() }),
      });

      if (response.ok) {
        setSuccessMessage("Household name updated successfully!");
        loadData();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error updating household:", error);
    } finally {
      setIsSavingHousehold(false);
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMember || !memberName.trim()) return;

    setIsSavingMember(true);
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/members/${currentMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: memberName.trim(),
          colorHex: memberColor,
          emoji: memberEmoji,
        }),
      });

      if (response.ok) {
        setSuccessMessage("Profile updated successfully!");
        loadData();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error updating member:", error);
    } finally {
      setIsSavingMember(false);
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

      <main className="max-w-3xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Settings</h2>

        {successMessage && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        <div className="space-y-6">
          {/* Household Settings */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Household Settings
            </h3>
            <form onSubmit={handleSaveHousehold} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Household Name
                </label>
                <input
                  type="text"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Household Code
                </label>
                <input
                  type="text"
                  value={code}
                  disabled
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Share this code with housemates to join
                </p>
              </div>
              <button
                type="submit"
                disabled={isSavingHousehold || !householdName.trim()}
                className="flex items-center gap-2 bg-indigo-500 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {isSavingHousehold ? "Saving..." : "Save Household"}
              </button>
            </form>
          </div>

          {/* Member Profile Settings */}
          {currentMember && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Your Profile
              </h3>
              <form onSubmit={handleSaveMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Color
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setMemberColor(color)}
                        className={`w-12 h-12 rounded-lg transition-all ${
                          memberColor === color
                            ? "ring-2 ring-offset-2 ring-indigo-500 scale-110"
                            : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Emoji
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {availableEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setMemberEmoji(emoji)}
                        className={`w-12 h-12 rounded-lg bg-slate-50 hover:bg-slate-100 text-2xl transition-all ${
                          memberEmoji === emoji
                            ? "ring-2 ring-offset-2 ring-indigo-500 scale-110"
                            : "hover:scale-105"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingMember || !memberName.trim()}
                  className="flex items-center gap-2 bg-indigo-500 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {isSavingMember ? "Saving..." : "Save Profile"}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
