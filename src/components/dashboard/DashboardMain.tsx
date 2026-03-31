"use client";

import { useState } from "react";
import { Folder, Layers, Pin, Star } from "lucide-react";
import { items, type ItemType } from "@/lib/mock-data";
import { type SpaceRow } from "@/lib/db/spaces";
import { TYPE_CONFIG, ITEM_TYPES } from "@/lib/type-config";
import { StatCard } from "@/components/dashboard/StatCard";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { FilterTab } from "@/components/dashboard/FilterTab";
import { RecentSpaces } from "@/components/dashboard/RecentSpaces";

export function DashboardMain({ spaces }: { spaces: SpaceRow[] }) {
  const [itemFilter, setItemFilter] = useState<ItemType | "ALL">("ALL");

  const pinnedItems = items.filter((i) => i.isPinned);
  const favoriteItems = items.filter((i) => i.isFavorite);

  const filteredItems =
    itemFilter === "ALL" ? items : items.filter((i) => i.type === itemFilter);
  const recentItems = filteredItems.slice(0, 10);

  const typeCounts = ITEM_TYPES.reduce(
    (acc, type) => ({
      ...acc,
      [type]: items.filter((i) => i.type === type).length,
    }),
    {} as Record<ItemType, number>,
  );

  return (
    <main className="flex-1 h-full overflow-auto">
      <div className="p-6 space-y-7">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard
            label="Total Items"
            value={items.length}
            icon={Layers}
            color="#60a5fa"
          />
          <StatCard
            label="Favorite Items"
            value={favoriteItems.length}
            icon={Star}
            color="#fbbf24"
          />
          <StatCard
            label="Spaces"
            value={spaces.length}
            icon={Folder}
            color="#a78bfa"
          />
        </div>

        {/* Recent Spaces */}
        <RecentSpaces spaces={spaces} />

        {/* Pinned Items */}
        {pinnedItems.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
              <Pin size={13} className="text-muted-foreground" />
              Pinned
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pinnedItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Items */}
        <section>
          <h2 className="text-sm font-semibold mb-3">Recent Items</h2>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 flex-wrap pb-3 mb-4 border-b border-border">
            <FilterTab
              active={itemFilter === "ALL"}
              onClick={() => setItemFilter("ALL")}
              label="All"
              count={items.length}
            />
            {ITEM_TYPES.map((type) =>
              typeCounts[type] > 0 ? (
                <FilterTab
                  key={type}
                  active={itemFilter === type}
                  onClick={() => setItemFilter(type)}
                  label={TYPE_CONFIG[type].plural}
                  count={typeCounts[type]}
                  icon={TYPE_CONFIG[type].icon}
                  color={TYPE_CONFIG[type].color}
                />
              ) : null,
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
