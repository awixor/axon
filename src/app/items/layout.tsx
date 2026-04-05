import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { TopBar } from "@/components/dashboard/TopBar";
import { getRecentSpaces } from "@/lib/db/spaces";
import { getUser } from "@/lib/db/users";

export default async function ItemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = session?.user?.id ? await getUser(session.user.id) : null;
  const spaces = await getRecentSpaces(user?.teamId ?? "");

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
