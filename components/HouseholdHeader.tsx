"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  name: string;
  emoji?: string | null;
}

interface HouseholdHeaderProps {
  householdName: string;
  householdCode: string;
  currentMember?: Member | null;
}

export function HouseholdHeader({
  householdName,
  householdCode,
  currentMember,
}: HouseholdHeaderProps) {
  const pathname = usePathname();

  const tabs = [
    { name: "Dashboard", href: `/house/${householdCode}` },
    { name: "Events", href: `/house/${householdCode}/events` },
    { name: "Settings", href: `/house/${householdCode}/settings` },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            {householdName}
          </h1>
          {currentMember && (
            <Link href={`/house/${householdCode}/settings`}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                <span className="text-2xl">{currentMember.emoji || "👤"}</span>
                <span className="text-sm font-medium text-slate-700 hidden md:block">
                  {currentMember.name}
                </span>
              </div>
            </Link>
          )}
        </div>

        <nav className="flex gap-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
