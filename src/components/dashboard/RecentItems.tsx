"use client";

import { useState } from "react";
import { type ItemRow } from "@/lib/db/items";
import { type ItemType } from "@/types/items";
import { TYPE_CONFIG, ITEM_TYPES } from "@/lib/type-config";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { FilterTab } from "@/components/dashboard/FilterTab";

export function RecentItems({ items }: { items: ItemRow[] }) {
  const [filter, setFilter] = useState<ItemType | "ALL">("ALL");

  const filtered =
    filter === "ALL" ? items : items.filter((i) => i.type === filter);

  const typeCounts = ITEM_TYPES.reduce(
    (acc, type) => ({
      ...acc,
      [type]: items.filter((i) => i.type === type).length,
    }),
    {} as Record<ItemType, number>,
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
          typeCounts[type] > 0 ? (
            <FilterTab
              key={type}
              active={filter === type}
              onClick={() => setFilter(type)}
              label={TYPE_CONFIG[type].plural}
              count={typeCounts[type]}
              icon={TYPE_CONFIG[type].icon}
              color={TYPE_CONFIG[type].color}
            />
          ) : null,
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground col-span-3 py-4">
            No items found.
          </p>
        )}
      </div>
    </section>
  );
}
