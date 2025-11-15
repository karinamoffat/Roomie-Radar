"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { HouseholdHeader } from "@/components/HouseholdHeader";
import { MemberCard } from "@/components/MemberCard";
import { GroceryTripCard } from "@/components/GroceryTripCard";
import { CalendarView } from "@/components/CalendarView";
import { getLocalMemberId, setLocalMemberId } from "@/lib/member-storage";
import { Plus } from "lucide-react";

interface Member {
  id: string;
  name: string;
  colorHex: string;
  emoji?: string | null;
  statuses?: any[];
  events?: any[];
  groceries?: any[];
}

interface Household {
  id: string;
  name: string;
  code: string;
  members: Member[];
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

export default function HouseDashboard() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [household, setHousehold] = useState<Household | null>(null);
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [currentView, setCurrentView] = useState<"dashboard" | "calendar">("dashboard");

  // Setup form state
  const [setupName, setSetupName] = useState("");
  const [setupColor, setSetupColor] = useState(availableColors[0]);
  const [setupEmoji, setSetupEmoji] = useState(availableEmojis[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadHousehold();
  }, [code]);

  const loadHousehold = async () => {
    try {
      const response = await fetch(`/api/households/${code}`);
      if (!response.ok) {
        router.push("/");
        return;
      }

      const data = await response.json();
      setHousehold(data);

      // Check for current member
      const memberId = getLocalMemberId(code);
      if (memberId) {
        // Verify member still exists in household
        const memberExists = data.members.some((m: Member) => m.id === memberId);
        if (memberExists) {
          setCurrentMemberId(memberId);
        } else {
          setShowSetup(true);
        }
      } else {
        setShowSetup(true);
      }
    } catch (error) {
      console.error("Error loading household:", error);
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupName.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          householdCode: code,
          name: setupName.trim(),
          colorHex: setupColor,
          emoji: setupEmoji,
        }),
      });

      if (response.ok) {
        const member = await response.json();
        setLocalMemberId(code, member.id);
        setCurrentMemberId(member.id);
        setShowSetup(false);
        loadHousehold();
      }
    } catch (error) {
      console.error("Error creating member:", error);
    } finally {
      setIsSubmitting(false);
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

  if (showSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Join {household.name}
          </h2>
          <p className="text-slate-600 mb-6">
            Set up your profile to get started
          </p>

          <form onSubmit={handleSetupSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={setupName}
                onChange={(e) => setSetupName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pick a Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSetupColor(color)}
                    className={`w-12 h-12 rounded-lg transition-all ${
                      setupColor === color
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
                Pick an Emoji
              </label>
              <div className="flex gap-2 flex-wrap">
                {availableEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSetupEmoji(emoji)}
                    className={`w-12 h-12 rounded-lg bg-slate-50 hover:bg-slate-100 text-2xl transition-all ${
                      setupEmoji === emoji
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
              disabled={isSubmitting || !setupName.trim()}
              className="w-full bg-indigo-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const currentMember = household.members.find((m) => m.id === currentMemberId);
  const otherMembers = household.members.filter((m) => m.id !== currentMemberId);
  const activeGroceryTrips = household.members.flatMap((m) =>
    (m.groceries || []).filter((g) => g.isActive).map((g) => ({ ...g, member: m }))
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <HouseholdHeader
        householdName={household.name}
        householdCode={code}
        currentMember={currentMember || null}
      />

      {/* View Toggle */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setCurrentView("dashboard")}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              currentView === "dashboard"
                ? "bg-indigo-500 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView("calendar")}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              currentView === "calendar"
                ? "bg-indigo-500 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pb-6">
        {currentView === "dashboard" ? (
          <>
            {/* Active Grocery Trips */}
            {activeGroceryTrips.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Plus size={20} className="text-emerald-600" />
                  Active Grocery Trips
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {activeGroceryTrips.map((trip) => (
                    <GroceryTripCard
                      key={trip.id}
                      trip={trip}
                      isOwner={trip.member.id === currentMemberId}
                      currentMemberName={currentMember?.name || ""}
                      onUpdate={loadHousehold}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Main Layout: Left 1/3 Current User, Right 2/3 Others */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Third - Current User Card */}
              {currentMember && (
                <div className="lg:w-1/3">
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">You</h2>
                  <MemberCard
                    member={currentMember}
                    isCurrentUser={true}
                    onUpdate={loadHousehold}
                  />
                </div>
              )}

              {/* Right Two Thirds - Other Housemates */}
              <div className="lg:w-2/3">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Housemates</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {otherMembers.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      isCurrentUser={false}
                      onUpdate={loadHousehold}
                    />
                  ))}
                </div>
                {otherMembers.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                    <p className="text-slate-500">No other housemates yet!</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <CalendarView members={household.members} />
        )}
      </main>
    </div>
  );
}
