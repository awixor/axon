import { auth } from "@/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { TopBar } from "@/components/dashboard/TopBar";
import { getRecentSpaces } from "@/lib/db/spaces";
import { getUser } from "@/lib/db/users";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const [spaces, user] = await Promise.all([
    getRecentSpaces("team-demo"),
    session?.user?.id ? getUser(session.user.id) : Promise.resolve(null),
  ]);

  return (
    <SidebarProvider>
      <div className="flex h-full">
        <Sidebar spaces={spaces} user={user} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <div className="flex-1 overflow-hidden">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
