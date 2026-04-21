"use client";

import { useState } from "react";
import { type ItemRow } from "@/lib/db/items";
import { type SpaceOption } from "@/lib/db/spaces";
import { type ItemType } from "@/types/items";
import { TYPE_CONFIG, ITEM_TYPES } from "@/lib/type-config";
import { FilterTab } from "@/components/dashboard/FilterTab";
import { ItemsGrid } from "@/components/dashboard/ItemsGrid";
import { AssetListView } from "@/components/dashboard/AssetListView";

export function SpaceItemsGrid({
  items,
  spaces,
}: {
  items: ItemRow[];
  spaces: SpaceOption[];
}) {
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

  const presentTypes = ITEM_TYPES.filter((t) => (typeCounts[t] ?? 0) > 0);

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No items in this space yet.</p>
    );
  }

  return (
    <div>
      {presentTypes.length > 1 && (
        <div className="flex items-center gap-1 flex-wrap pb-3 mb-4 border-b border-border">
          <FilterTab
            active={filter === "ALL"}
            onClick={() => setFilter("ALL")}
            label="All"
            count={items.length}
          />
          {presentTypes.map((type) => (
            <FilterTab
              key={type}
              active={filter === type}
              onClick={() => setFilter(type)}
              label={TYPE_CONFIG[type].plural}
              count={typeCounts[type] ?? 0}
              icon={TYPE_CONFIG[type].icon}
              color={TYPE_CONFIG[type].color}
            />
          ))}
        </div>
      )}

      {filter === "ASSET" ? (
        <AssetListView
          items={filtered}
          spaces={spaces}
          emptyMessage="No assets in this space."
        />
      ) : (
        <ItemsGrid items={filtered} spaces={spaces} />
      )}
    </div>
  );
}
