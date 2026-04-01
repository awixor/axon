import { Activity, Layers, Pin, ShieldCheck } from "lucide-react";
import { type SpaceRow } from "@/lib/db/spaces";
import { type ItemRow } from "@/lib/db/items";
import { StatCard } from "@/components/dashboard/StatCard";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { RecentSpaces } from "@/components/dashboard/RecentSpaces";
import { RecentItems } from "@/components/dashboard/RecentItems";

type Props = {
  spaces: SpaceRow[];
  pinnedItems: ItemRow[];
  recentItems: ItemRow[];
  totalItems: number;
  verifiedItems: number;
  recentActivity: number;
};

export function DashboardMain({
  spaces,
  pinnedItems,
  recentItems,
  totalItems,
  verifiedItems,
  recentActivity,
}: Props) {
  return (
    <main className="flex-1 h-full overflow-auto">
      <div className="p-6 space-y-7">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard
            label="Total Items"
            value={totalItems}
            icon={Layers}
            color="#60a5fa"
          />
          <StatCard
            label="Verified Items"
            value={verifiedItems}
            icon={ShieldCheck}
            color="#34d399"
          />
          <StatCard
            label="Recent Activity"
            value={recentActivity}
            icon={Activity}
            color="#f87171"
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
        <RecentItems items={recentItems} />
      </div>
    </main>
  );
}
