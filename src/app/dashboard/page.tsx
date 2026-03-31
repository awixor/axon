import { DashboardMain } from "@/components/dashboard/DashboardMain";
import { getRecentSpaces } from "@/lib/db/spaces";

export default async function DashboardPage() {
  const spaces = await getRecentSpaces("team-demo");
  return <DashboardMain spaces={spaces} />;
}
