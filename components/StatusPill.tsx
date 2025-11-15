import { PartyPopper, Clapperboard, BookOpen, Plane, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusPillProps {
  label: string;
  category: string;
  isActive?: boolean;
}

const categoryStyles: Record<string, string> = {
  going_out: "bg-purple-100 text-purple-700 border-purple-200",
  chilling: "bg-amber-100 text-amber-700 border-amber-200",
  studying: "bg-blue-100 text-blue-700 border-blue-200",
  away: "bg-rose-100 text-rose-700 border-rose-200",
  working: "bg-emerald-100 text-emerald-700 border-emerald-200",
  custom: "bg-slate-100 text-slate-700 border-slate-200",
};

const categoryIcons: Record<string, React.ReactNode> = {
  going_out: <PartyPopper size={14} />,
  chilling: <Clapperboard size={14} />,
  studying: <BookOpen size={14} />,
  away: <Plane size={14} />,
  custom: <Circle size={14} />,
};

export function StatusPill({ label, category, isActive = true }: StatusPillProps) {
  const styles = categoryStyles[category] || categoryStyles.custom;
  const icon = categoryIcons[category] || categoryIcons.custom;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border",
        styles,
        !isActive && "opacity-50"
      )}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
