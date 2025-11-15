"use client";

import { useState } from "react";
import { Plus, ShoppingCart, Calendar, Heart, Moon, MessageSquare, Dumbbell, BookOpen } from "lucide-react";
import { EventListCompact } from "./EventListCompact";
import { CreateEventModal } from "./CreateEventModal";
import { CreateGroceryTripModal } from "./CreateGroceryTripModal";
import { ActivityTimeModal } from "./ActivityTimeModal";

interface Event {
  id: string;
  title: string;
  type: string;
  startsAt: Date | string;
  endsAt?: Date | string | null;
  location?: string | null;
  isHousewide: boolean;
}

interface GroceryTrip {
  id: string;
  storeName: string;
  leavingAt?: Date | string | null;
  isActive: boolean;
}

interface Member {
  id: string;
  name: string;
  colorHex: string;
  emoji?: string | null;
  currentMood?: string | null;
  tonightActivity?: string | null;
  isAtGym?: boolean;
  gymTime?: Date | string | null;
  isAtLibrary?: boolean;
  libraryTime?: Date | string | null;
  events?: Event[];
  groceries?: GroceryTrip[];
}

interface MemberCardProps {
  member: Member;
  isCurrentUser: boolean;
  onUpdate?: () => void;
}

const moodOptions = [
  { value: "stressed", label: "Stressed", emoji: "😰" },
  { value: "lazy", label: "Lazy", emoji: "😴" },
  { value: "sick", label: "Sick", emoji: "🤒" },
  { value: "happy", label: "Happy", emoji: "😊" },
];

const tonightOptions = [
  { value: "study", label: "Study", emoji: "📚" },
  { value: "watch_movie", label: "Watch a movie", emoji: "🎬" },
  { value: "bake", label: "Bake", emoji: "🧁" },
];

export function MemberCard({ member, isCurrentUser, onUpdate }: MemberCardProps) {
  const [showEventModal, setShowEventModal] = useState(false);
  const [showGroceryModal, setShowGroceryModal] = useState(false);
  const [showGymTimeModal, setShowGymTimeModal] = useState(false);
  const [showLibraryTimeModal, setShowLibraryTimeModal] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [selectedMood, setSelectedMood] = useState(member.currentMood || "");
  const [selectedActivity, setSelectedActivity] = useState(member.tonightActivity || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCustomMood, setShowCustomMood] = useState(false);
  const [customMood, setCustomMood] = useState("");
  const [showCustomActivity, setShowCustomActivity] = useState(false);
  const [customActivity, setCustomActivity] = useState("");

  const hasActiveGrocery = member.groceries?.some((g) => g.isActive);

  const handleModalSuccess = () => {
    onUpdate?.();
  };

  const handleMoodChange = async (mood: string) => {
    setSelectedMood(mood);
    setIsUpdating(true);
    try {
      await fetch(`/api/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentMood: mood }),
      });
      onUpdate?.();
    } catch (error) {
      console.error("Error updating mood:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleActivityChange = async (activity: string) => {
    setSelectedActivity(activity);
    setIsUpdating(true);
    try {
      await fetch(`/api/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tonightActivity: activity }),
      });
      onUpdate?.();
    } catch (error) {
      console.error("Error updating activity:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCustomMoodSubmit = async () => {
    if (!customMood.trim()) return;

    setIsUpdating(true);
    try {
      await fetch(`/api/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentMood: customMood.trim() }),
      });
      setSelectedMood(customMood.trim());
      setCustomMood("");
      setShowCustomMood(false);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating mood:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCustomActivitySubmit = async () => {
    if (!customActivity.trim()) return;

    setIsUpdating(true);
    try {
      await fetch(`/api/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tonightActivity: customActivity.trim() }),
      });
      setSelectedActivity(customActivity.trim());
      setCustomActivity("");
      setShowCustomActivity(false);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating activity:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAnnouncementSubmit = async () => {
    if (!announcement.trim()) return;

    setIsUpdating(true);
    try {
      await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: member.id,
          message: announcement.trim(),
        }),
      });
      setAnnouncement("");
      onUpdate?.();
    } catch (error) {
      console.error("Error posting announcement:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGymTimeSubmit = async (time: Date | null) => {
    setIsUpdating(true);
    try {
      await fetch(`/api/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isAtGym: time !== null,
          gymTime: time ? time.toISOString() : null,
        }),
      });
      onUpdate?.();
    } catch (error) {
      console.error("Error updating gym status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLibraryTimeSubmit = async (time: Date | null) => {
    setIsUpdating(true);
    try {
      await fetch(`/api/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isAtLibrary: time !== null,
          libraryTime: time ? time.toISOString() : null,
        }),
      });
      onUpdate?.();
    } catch (error) {
      console.error("Error updating library status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentMood = moodOptions.find((m) => m.value === member.currentMood);
  const currentActivity = tonightOptions.find((a) => a.value === member.tonightActivity);

  const formatTime = (dateTime: Date | string | null | undefined) => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 0) return "now";
    if (hours === 0) return `in ${minutes}m`;
    if (hours < 24) return `in ${hours}h`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 md:p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      {/* Header with colored stripe */}
      <div
        className="h-1 w-full rounded-full -mt-4 md:-mt-5 -mx-4 md:-mx-5"
        style={{ backgroundColor: member.colorHex }}
      />

      {/* Member info */}
      <div className="flex items-center gap-3 mt-2">
        <span className="text-3xl">{member.emoji || "👤"}</span>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">{member.name}</h3>
          {isCurrentUser && (
            <span className="text-xs text-indigo-600 font-medium">(You)</span>
          )}
        </div>
        <div className="flex gap-2">
          {hasActiveGrocery && (
            <ShoppingCart className="text-emerald-600" size={20} />
          )}
          {member.isAtGym && (
            <Dumbbell className="text-orange-600" size={20} />
          )}
          {member.isAtLibrary && (
            <BookOpen className="text-blue-600" size={20} />
          )}
        </div>
      </div>

      {/* Activity status for non-current users */}
      {!isCurrentUser && (member.isAtGym || member.isAtLibrary) && (
        <div className="text-xs text-slate-600 space-y-1">
          {member.isAtGym && (
            <div className="flex items-center gap-2">
              <Dumbbell size={14} className="text-orange-600" />
              <span>
                Going to the gym {member.gymTime && `(${formatTime(member.gymTime)})`}
              </span>
            </div>
          )}
          {member.isAtLibrary && (
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-blue-600" />
              <span>
                Going to the library {member.libraryTime && `(${formatTime(member.libraryTime)})`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Update all - only for current user */}
      {isCurrentUser && (
        <div className="border border-slate-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={16} className="text-indigo-600" />
            <label className="text-sm font-medium text-slate-700">Update all</label>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="Send an update to all housemates..."
              className="flex-1 px-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAnnouncementSubmit();
                }
              }}
            />
            <button
              onClick={handleAnnouncementSubmit}
              disabled={!announcement.trim() || isUpdating}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Tonight I want to */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Moon size={16} className="text-purple-600" />
          <label className="text-sm font-medium text-slate-700">Tonight I want to:</label>
        </div>
        {isCurrentUser ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {tonightOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleActivityChange(option.value)}
                  disabled={isUpdating}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedActivity === option.value
                      ? "bg-purple-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {option.emoji} {option.label}
                </button>
              ))}
              <button
                onClick={() => setShowCustomActivity(!showCustomActivity)}
                disabled={isUpdating}
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 border border-dashed border-slate-300"
              >
                + Add new
              </button>
            </div>
            {showCustomActivity && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customActivity}
                  onChange={(e) => setCustomActivity(e.target.value)}
                  placeholder="Enter custom activity..."
                  className="flex-1 px-3 py-1.5 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCustomActivitySubmit();
                    }
                  }}
                />
                <button
                  onClick={handleCustomActivitySubmit}
                  disabled={!customActivity.trim() || isUpdating}
                  className="px-3 py-1.5 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowCustomActivity(false);
                    setCustomActivity("");
                  }}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ) : member.tonightActivity ? (
          <div className="px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700 inline-flex items-center gap-1">
            {currentActivity ? (
              <>
                {currentActivity.emoji} {currentActivity.label}
              </>
            ) : (
              member.tonightActivity
            )}
          </div>
        ) : (
          <div className="text-sm text-slate-400 italic">Not set</div>
        )}
      </div>

      {/* I'm feeling */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Heart size={16} className="text-rose-600" />
          <label className="text-sm font-medium text-slate-700">I'm feeling:</label>
        </div>
        {isCurrentUser ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleMoodChange(option.value)}
                  disabled={isUpdating}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedMood === option.value
                      ? "bg-rose-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {option.emoji} {option.label}
                </button>
              ))}
              <button
                onClick={() => setShowCustomMood(!showCustomMood)}
                disabled={isUpdating}
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 border border-dashed border-slate-300"
              >
                + Add new
              </button>
            </div>
            {showCustomMood && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customMood}
                  onChange={(e) => setCustomMood(e.target.value)}
                  placeholder="Enter custom mood..."
                  className="flex-1 px-3 py-1.5 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCustomMoodSubmit();
                    }
                  }}
                />
                <button
                  onClick={handleCustomMoodSubmit}
                  disabled={!customMood.trim() || isUpdating}
                  className="px-3 py-1.5 bg-rose-500 text-white rounded-md hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowCustomMood(false);
                    setCustomMood("");
                  }}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ) : member.currentMood ? (
          <div className="px-3 py-1.5 rounded-full text-sm font-medium bg-rose-100 text-rose-700 inline-flex items-center gap-1">
            {currentMood ? (
              <>
                {currentMood.emoji} {currentMood.label}
              </>
            ) : (
              member.currentMood
            )}
          </div>
        ) : (
          <div className="text-sm text-slate-400 italic">Not set</div>
        )}
      </div>

      {/* Add an event button - for all users */}
      <button
        onClick={() => setShowEventModal(true)}
        className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-2.5 px-4 rounded-lg font-medium hover:bg-slate-200 transition-colors text-sm border border-slate-200"
      >
        <Calendar size={16} />
        Add an event
      </button>

      {/* Upcoming events */}
      <div>
        <div className="text-xs font-medium text-slate-500 mb-2">
          Upcoming Events
        </div>
        <EventListCompact events={member.events || []} maxItems={3} />
      </div>

      {/* Activity buttons - only for current user */}
      {isCurrentUser && (
        <div className="space-y-2">
          <button
            onClick={() => setShowGymTimeModal(true)}
            disabled={isUpdating}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-colors text-sm ${
              member.isAtGym
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-orange-100 text-orange-700 hover:bg-orange-200"
            }`}
          >
            <Dumbbell size={16} />
            <span className="flex-1 text-left">
              {member.isAtGym ? "At the gym" : "Going to the gym"}
            </span>
            {member.gymTime && (
              <span className="text-xs opacity-90">{formatTime(member.gymTime)}</span>
            )}
          </button>
          <button
            onClick={() => setShowLibraryTimeModal(true)}
            disabled={isUpdating}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-colors text-sm ${
              member.isAtLibrary
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            <BookOpen size={16} />
            <span className="flex-1 text-left">
              {member.isAtLibrary ? "At the library" : "Going to the library"}
            </span>
            {member.libraryTime && (
              <span className="text-xs opacity-90">{formatTime(member.libraryTime)}</span>
            )}
          </button>
          <button
            onClick={() => setShowGroceryModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 py-2.5 px-4 rounded-lg font-medium hover:bg-emerald-200 transition-colors text-sm"
          >
            <ShoppingCart size={16} />
            Going grocery shopping
          </button>
        </div>
      )}

      {/* Modals */}
      <CreateEventModal
        open={showEventModal}
        onClose={() => setShowEventModal(false)}
        memberId={member.id}
        onSuccess={handleModalSuccess}
      />
      <CreateGroceryTripModal
        open={showGroceryModal}
        onClose={() => setShowGroceryModal(false)}
        memberId={member.id}
        onSuccess={handleModalSuccess}
      />
      <ActivityTimeModal
        open={showGymTimeModal}
        onClose={() => setShowGymTimeModal(false)}
        activityName="gym"
        onSubmit={handleGymTimeSubmit}
      />
      <ActivityTimeModal
        open={showLibraryTimeModal}
        onClose={() => setShowLibraryTimeModal(false)}
        activityName="library"
        onSubmit={handleLibraryTimeSubmit}
      />
    </div>
  );
}
