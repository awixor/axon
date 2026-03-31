"use client";

import { useState } from "react";
import { type SpaceRow } from "@/lib/db/spaces";
import { SpaceCard } from "@/components/dashboard/SpaceCard";
import { FilterTab } from "@/components/dashboard/FilterTab";

type SpaceFilter = "ALL" | "TEAM" | "PERSONAL";

const SPACE_FILTERS: { value: SpaceFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "TEAM", label: "Team" },
  { value: "PERSONAL", label: "Personal" },
];

export function RecentSpaces({ spaces }: { spaces: SpaceRow[] }) {
  const [filter, setFilter] = useState<SpaceFilter>("ALL");

  const filtered = spaces.filter((s) => {
    if (filter === "TEAM") return !s.isPersonal;
    if (filter === "PERSONAL") return s.isPersonal;
    return true;
  });

  return (
    <section>
      <div className="flex flex-col gap-3 mb-3">
        <h2 className="text-sm font-semibold">Recent Spaces</h2>
        <div className="flex items-center gap-1">
          {SPACE_FILTERS.map(({ value, label }) => (
            <FilterTab
              key={value}
              active={filter === value}
              onClick={() => setFilter(value)}
              label={label}
            />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((space) => (
          <SpaceCard key={space.id} space={space} />
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground col-span-3 py-4">
            No spaces found.
          </p>
        )}
      </div>
    </section>
  );
}
