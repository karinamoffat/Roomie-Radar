"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { HouseholdHeader } from "@/components/HouseholdHeader";
import { getLocalMemberId } from "@/lib/member-storage";
import { Calendar, Bell, Users, Plane, MapPin, Clock } from "lucide-react";
import { format, isToday, isTomorrow, startOfDay } from "date-fns";

interface Member {
  id: string;
  name: string;
  emoji?: string | null;
  colorHex: string;
}

interface Event {
  id: string;
  title: string;
  type: string;
  startsAt: string;
  endsAt?: string | null;
  location?: string | null;
  details?: string | null;
  isHousewide: boolean;
  member: Member;
}

interface Household {
  id: string;
  name: string;
  code: string;
}

const eventIcons: Record<string, React.ReactNode> = {
  exam: <Bell className="text-blue-600" size={20} />,
  guest: <Users className="text-purple-600" size={20} />,
  trip: <Plane className="text-rose-600" size={20} />,
  other: <Calendar className="text-slate-600" size={20} />,
};

function formatEventDate(date: string): string {
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "EEEE, MMMM d");
}

function groupEventsByDate(events: Event[]): Map<string, Event[]> {
  const grouped = new Map<string, Event[]>();

  events.forEach((event) => {
    const dateKey = startOfDay(new Date(event.startsAt)).toISOString();
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(event);
  });

  return grouped;
}

export default function EventsPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [household, setHousehold] = useState<Household | null>(null);
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
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
        const member = householdData.members.find((m: Member) => m.id === memberId);
        setCurrentMember(member || null);
      }

      // Load events
      const eventsRes = await fetch(`/api/events?householdCode=${code}`);
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData);
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

  const groupedEvents = groupEventsByDate(events);
  const sortedDates = Array.from(groupedEvents.keys()).sort();

  return (
    <div className="min-h-screen bg-slate-100">
      <HouseholdHeader
        householdName={household.name}
        householdCode={code}
        currentMember={currentMember}
      />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Upcoming Events</h2>

        {events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <Calendar className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-500">No upcoming events</p>
            <p className="text-sm text-slate-400 mt-1">
              Add events from the dashboard to see them here
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((dateKey) => {
              const dayEvents = groupedEvents.get(dateKey) || [];
              return (
                <div key={dateKey}>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    {formatEventDate(dateKey)}
                  </h3>
                  <div className="space-y-3">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">{eventIcons[event.type] || eventIcons.other}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h4 className="font-semibold text-slate-900 mb-1">
                                  {event.title}
                                  {event.isHousewide && (
                                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                      Important for everyone
                                    </span>
                                  )}
                                </h4>
                                <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                                  <span
                                    className="inline-flex items-center gap-1"
                                    style={{ color: event.member.colorHex }}
                                  >
                                    {event.member.emoji} {event.member.name}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1 text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <Clock size={14} />
                                <span>
                                  {format(new Date(event.startsAt), "h:mm a")}
                                  {event.endsAt && ` - ${format(new Date(event.endsAt), "h:mm a")}`}
                                </span>
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin size={14} />
                                  <span>{event.location}</span>
                                </div>
                              )}
                            </div>

                            {event.details && (
                              <p className="mt-2 text-sm text-slate-600 italic">
                                {event.details}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
