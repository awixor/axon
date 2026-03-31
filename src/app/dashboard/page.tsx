import { DashboardMain } from "@/components/dashboard/DashboardMain";
import { getRecentSpaces } from "@/lib/db/spaces";
import { getRecentItems, getPinnedItems, getItemCounts } from "@/lib/db/items";

export default async function DashboardPage() {
  const [spaces, recentItems, pinnedItems, { total }] = await Promise.all([
    getRecentSpaces("team-demo"),
    getRecentItems("team-demo"),
    getPinnedItems("team-demo"),
    getItemCounts("team-demo"),
  ]);

  return (
    <DashboardMain
      spaces={spaces}
      recentItems={recentItems}
      pinnedItems={pinnedItems}
      totalItems={total}
    />
  );
}
