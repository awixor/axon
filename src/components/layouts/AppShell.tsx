import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { TopBar } from "@/components/dashboard/TopBar";
import { getRecentSpaces, getAllSpaces } from "@/lib/db/spaces";
import { getUser } from "@/lib/db/users";

export default async function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");

  const user = await getUser(session.user.id);
  const teamId = user?.teamId ?? "";

  const [spaces, allSpaces] = await Promise.all([
    getRecentSpaces(teamId),
    getAllSpaces(teamId),
  ]);

  return (
    <SidebarProvider>
      <div className="flex h-full">
        <Sidebar spaces={spaces} user={user} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar spaces={allSpaces} />
          <div className="flex-1 overflow-hidden">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
