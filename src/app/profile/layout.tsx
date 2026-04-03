import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { TopBar } from "@/components/dashboard/TopBar";
import { getRecentSpaces } from "@/lib/db/spaces";
import { getUser } from "@/lib/db/users";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  const user = await getUser(session.user.id);
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
