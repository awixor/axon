import { DashboardMain } from "@/components/dashboard/DashboardMain";
import { getRecentSpaces } from "@/lib/db/spaces";
import { getRecentItems, getPinnedItems, getItemCounts } from "@/lib/db/items";
import { getSession } from "@/lib/session";
import { getUser } from "@/lib/db/users";

export default async function DashboardPage() {
  const session = await getSession();
  const user = session?.user?.id ? await getUser(session.user.id) : null;
  const teamId = user?.teamId ?? "";

  const [spaces, recentItems, pinnedItems, { total, verified, recentActivity }] =
    await Promise.all([
      getRecentSpaces(teamId),
      getRecentItems(teamId),
      getPinnedItems(teamId),
      getItemCounts(teamId),
    ]);

  return (
    <DashboardMain
      spaces={spaces}
      recentItems={recentItems}
      pinnedItems={pinnedItems}
      totalItems={total}
      verifiedItems={verified}
      recentActivity={recentActivity}
    />
  );
}
