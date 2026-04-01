import { Sidebar } from '@/components/dashboard/Sidebar'
import { SidebarProvider } from '@/components/dashboard/SidebarContext'
import { TopBar } from '@/components/dashboard/TopBar'
import { getRecentSpaces } from '@/lib/db/spaces'
import { getUser } from '@/lib/db/users'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [spaces, user] = await Promise.all([
    getRecentSpaces('team-demo'),
    getUser('user-demo'),
  ])

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
  )
}
