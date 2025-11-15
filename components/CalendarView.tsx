"use client";

import { Calendar } from "lucide-react";

interface Event {
  id: string;
  title: string;
  type: string;
  startsAt: Date | string;
  endsAt?: Date | string | null;
  location?: string | null;
  isHousewide: boolean;
  details?: string | null;
}

interface Member {
  id: string;
  name: string;
  colorHex: string;
  emoji?: string | null;
  events?: Event[];
}

interface CalendarViewProps {
  members: Member[];
}

export function CalendarView({ members }: CalendarViewProps) {
  // Collect all events from all members with member info
  const allEvents = members.flatMap((member) =>
    (member.events || []).map((event) => ({
      ...event,
      member,
    }))
  );

  // Sort events by start date
  const sortedEvents = allEvents.sort((a, b) => {
    const dateA = new Date(a.startsAt).getTime();
    const dateB = new Date(b.startsAt).getTime();
    return dateA - dateB;
  });

  // Group events by date
  const eventsByDate = sortedEvents.reduce((acc, event) => {
    const date = new Date(event.startsAt);
    const dateKey = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, typeof sortedEvents>);

  // Get today's date for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (date: Date) => {
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate.getTime() === today.getTime();
  };

  const isPast = (date: Date) => {
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate.getTime() < today.getTime();
  };

  if (sortedEvents.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 text-center">
        <Calendar className="mx-auto mb-4 text-slate-300" size={48} />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No events yet</h3>
        <p className="text-slate-500">
          Events added by housemates will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
        <Calendar size={24} className="text-indigo-600" />
        Upcoming Events
      </h2>

      <div className="space-y-8">
        {Object.entries(eventsByDate).map(([dateKey, events]) => {
          const firstEventDate = new Date(events[0].startsAt);
          const isTodayDate = isToday(firstEventDate);
          const isPastDate = isPast(firstEventDate);

          return (
            <div key={dateKey}>
              {/* Date Header */}
              <div
                className={`sticky top-0 bg-white py-2 mb-4 border-b-2 ${
                  isTodayDate
                    ? "border-indigo-500"
                    : isPastDate
                    ? "border-slate-200"
                    : "border-slate-300"
                }`}
              >
                <h3
                  className={`font-semibold ${
                    isTodayDate
                      ? "text-indigo-600 text-lg"
                      : isPastDate
                      ? "text-slate-400"
                      : "text-slate-700"
                  }`}
                >
                  {isTodayDate && "Today - "}
                  {dateKey}
                </h3>
              </div>

              {/* Events for this date */}
              <div className="space-y-3 ml-4">
                {events.map((event) => {
                  const startTime = new Date(event.startsAt).toLocaleTimeString(
                    "en-US",
                    {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    }
                  );

                  let endTime = null;
                  if (event.endsAt) {
                    endTime = new Date(event.endsAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    });
                  }

                  return (
                    <div
                      key={event.id}
                      className="flex gap-3 p-4 rounded-xl border-l-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                      style={{ borderLeftColor: event.member.colorHex }}
                    >
                      {/* Event indicator */}
                      <div className="flex flex-col items-center pt-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: event.member.colorHex }}
                        />
                      </div>

                      {/* Event details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900">
                            {event.title}
                          </h4>
                          {event.isHousewide && (
                            <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium whitespace-nowrap">
                              Important
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                          <span className="font-medium">
                            {startTime}
                            {endTime && ` - ${endTime}`}
                          </span>
                          {event.location && (
                            <>
                              <span>•</span>
                              <span>{event.location}</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-xl">{event.member.emoji}</span>
                          <span
                            className="font-medium"
                            style={{ color: event.member.colorHex }}
                          >
                            {event.member.name}
                          </span>
                          {event.details && (
                            <>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-600">{event.details}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
