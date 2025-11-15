import { Calendar, Bell, Users, Plane } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";

interface Event {
  id: string;
  title: string;
  type: string;
  startsAt: Date | string;
  endsAt?: Date | string | null;
  location?: string | null;
  isHousewide: boolean;
}

interface EventListCompactProps {
  events: Event[];
  maxItems?: number;
}

const eventIcons: Record<string, React.ReactNode> = {
  exam: <Bell size={14} className="text-blue-600" />,
  guest: <Users size={14} className="text-purple-600" />,
  trip: <Plane size={14} className="text-rose-600" />,
  other: <Calendar size={14} className="text-slate-600" />,
};

function formatEventTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (isToday(d)) {
    return `Today at ${format(d, "h:mm a")}`;
  } else if (isTomorrow(d)) {
    return `Tomorrow at ${format(d, "h:mm a")}`;
  } else {
    return format(d, "MMM d, h:mm a");
  }
}

export function EventListCompact({ events, maxItems = 3 }: EventListCompactProps) {
  const displayEvents = events.slice(0, maxItems);

  if (displayEvents.length === 0) {
    return (
      <div className="text-sm text-slate-400 italic">
        No upcoming events
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayEvents.map((event) => (
        <div
          key={event.id}
          className="flex items-start gap-2 text-sm"
        >
          <div className="mt-0.5">
            {eventIcons[event.type] || eventIcons.other}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-slate-900 truncate">
              {event.title}
              {event.isHousewide && (
                <span className="ml-1 text-xs text-indigo-600">
                  (Everyone)
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500">
              {formatEventTime(event.startsAt)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
