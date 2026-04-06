"use client";

import { useState } from "react";
import { type ItemRow } from "@/lib/db/items";
import { type ItemType } from "@/types/items";
import { TYPE_CONFIG, ITEM_TYPES } from "@/lib/type-config";
import { FilterTab } from "@/components/dashboard/FilterTab";
import { ItemsGrid } from "@/components/dashboard/ItemsGrid";

export function RecentItems({ items }: { items: ItemRow[] }) {
  const [filter, setFilter] = useState<ItemType | "ALL">("ALL");

  const filtered =
    filter === "ALL" ? items : items.filter((i) => i.type === filter);

  const typeCounts = items.reduce(
    (acc, item) => {
      acc[item.type] = (acc[item.type] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<ItemType, number>>,
  );

  return (
    <section>
      <h2 className="text-sm font-semibold mb-3">Recent Items</h2>

      <div className="flex items-center gap-1 flex-wrap pb-3 mb-4 border-b border-border">
        <FilterTab
          active={filter === "ALL"}
          onClick={() => setFilter("ALL")}
          label="All"
          count={items.length}
        />
        {ITEM_TYPES.map((type) =>
          (typeCounts[type] ?? 0) > 0 ? (
            <FilterTab
              key={type}
              active={filter === type}
              onClick={() => setFilter(type)}
              label={TYPE_CONFIG[type].plural}
              count={typeCounts[type] ?? 0}
              icon={TYPE_CONFIG[type].icon}
              color={TYPE_CONFIG[type].color}
            />
          ) : null,
        )}
      </div>

      <ItemsGrid items={filtered} />
    </section>
  );
}
