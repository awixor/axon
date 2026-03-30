"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Code2,
  FileText,
  Globe,
  Layers,
  Layout,
  Paperclip,
  Pin,
  ShieldCheck,
  Star,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { items, spaces, type Item, type ItemType } from "@/lib/mock-data";

const TYPE_CONFIG: Record<
  ItemType,
  { label: string; plural: string; icon: React.ElementType; color: string }
> = {
  SNIPPET: {
    label: "Snippet",
    plural: "Snippets",
    icon: Code2,
    color: "#60a5fa",
  },
  RUNBOOK: {
    label: "Runbook",
    plural: "Runbooks",
    icon: Terminal,
    color: "#f87171",
  },
  SECRET_REF: {
    label: "Secret",
    plural: "Secrets",
    icon: ShieldCheck,
    color: "#fbbf24",
  },
  DOC: { label: "Doc", plural: "Docs", icon: FileText, color: "#a78bfa" },
  RESOURCE: {
    label: "Resource",
    plural: "Resources",
    icon: Globe,
    color: "#34d399",
  },
  ASSET: {
    label: "Asset",
    plural: "Assets",
    icon: Paperclip,
    color: "#94a3b8",
  },
  BLUEPRINT: {
    label: "Blueprint",
    plural: "Blueprints",
    icon: Layout,
    color: "#6366f1",
  },
};

const ITEM_TYPES = Object.keys(TYPE_CONFIG) as ItemType[];

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon size={14} style={{ color }} />
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function ItemCard({ item }: { item: Item }) {
  const config = TYPE_CONFIG[item.type];
  const Icon = config.icon;

  return (
    <div className="relative rounded-lg border border-border bg-card overflow-hidden hover:border-border/60 transition-colors cursor-pointer">
      {/* Corner glow */}
      <div
        className="absolute bottom-0 right-0 w-28 h-28 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 100% 100%, ${config.color}2e, transparent 65%)`,
        }}
      />
      <div className="relative p-4 flex flex-col min-h-40">
        {/* Type badge */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Icon size={12} style={{ color: config.color }} />
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: config.color }}
            >
              {config.label}
            </span>
          </div>
          {item.isPinned && <Pin size={11} className="text-muted-foreground" />}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm leading-snug mb-2">
          {item.title}
        </h3>

        {/* Content preview */}
        <p className="text-xs text-muted-foreground font-mono leading-relaxed line-clamp-3 flex-1 mb-3">
          {item.content}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {item.isVerified && (
            <span className="flex items-center gap-1 text-emerald-400 shrink-0">
              <BadgeCheck size={11} />
              Verified
            </span>
          )}
          <span className="ml-auto truncate">
            {item.authorName} · {item.updatedAt}
          </span>
        </div>
      </div>
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  label,
  count,
  icon: Icon,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon?: React.ElementType;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors",
        active
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
      )}
    >
      {Icon && <Icon size={12} style={active ? { color } : undefined} />}
      <span>{label}</span>
      <span
        className={cn(
          "tabular-nums",
          active ? "text-foreground" : "text-muted-foreground/70",
        )}
      >
        {count}
      </span>
    </button>
  );
}

export function DashboardMain() {
  const [filter, setFilter] = useState<ItemType | "ALL">("ALL");

  const pinnedItems = items.filter((i) => i.isPinned);
  const favoriteItems = items.filter((i) => i.isFavorite);
  const favoriteSpaces = spaces.filter((s) => s.isFavorite);

  const filteredItems =
    filter === "ALL" ? items : items.filter((i) => i.type === filter);
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Total Items"
            value={items.length}
            icon={Layers}
            color="#60a5fa"
          />
          <StatCard
            label="Collections"
            value={spaces.length}
            icon={Layers}
            color="#a78bfa"
          />
          <StatCard
            label="Favorite Items"
            value={favoriteItems.length}
            icon={Star}
            color="#fbbf24"
          />
          <StatCard
            label="Fav Collections"
            value={favoriteSpaces.length}
            icon={Star}
            color="#f87171"
          />
        </div>

        {/* Recent Collections */}
        <section>
          <h2 className="text-sm font-semibold mb-3">Recent Collections</h2>
          <div className="flex flex-wrap gap-2">
            {spaces.map((space) => (
              <div
                key={space.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card text-sm cursor-pointer hover:bg-accent transition-colors"
              >
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: space.color }}
                />
                <span>{space.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {space.itemCount}
                </span>
                {space.isFavorite && (
                  <Star
                    size={11}
                    className="text-amber-400 fill-amber-400 shrink-0"
                  />
                )}
              </div>
            ))}
          </div>
        </section>

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
