import { Sidebar } from '@/components/dashboard/Sidebar'
import { SidebarProvider } from '@/components/dashboard/SidebarContext'
import { TopBar } from '@/components/dashboard/TopBar'
import { getRecentSpaces } from '@/lib/db/spaces'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const spaces = await getRecentSpaces('team-demo')

  return (
    <SidebarProvider>
      <div className="flex h-full">
        <Sidebar spaces={spaces} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <div className="flex-1 overflow-hidden">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  )
}
