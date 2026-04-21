import { DashboardMain } from "@/components/dashboard/DashboardMain";
import { getRecentSpaces, getAllSpaces } from "@/lib/db/spaces";
import { getRecentItems, getPinnedItems, getItemCounts } from "@/lib/db/items";
import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getSession();
  const teamId = session?.user?.teamId ?? "";

  const [spaces, allSpaces, recentItems, pinnedItems, { total, verified, recentActivity }] =
    await Promise.all([
      getRecentSpaces(teamId),
      getAllSpaces(teamId),
      getRecentItems(teamId),
      getPinnedItems(teamId),
      getItemCounts(teamId),
    ]);

  return (
    <DashboardMain
      spaces={spaces}
      allSpaces={allSpaces}
      recentItems={recentItems}
      pinnedItems={pinnedItems}
      totalItems={total}
      verifiedItems={verified}
      recentActivity={recentActivity}
    />
  );
}
