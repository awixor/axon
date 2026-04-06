'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Menu, Plus, Search } from 'lucide-react'
import { useSidebar } from './SidebarContext'
import { NewItemDialog } from './NewItemDialog'
import type { SpaceOption } from '@/lib/db/spaces'

type Props = {
  spaces: SpaceOption[]
}

export function TopBar({ spaces }: Props) {
  const { setMobileOpen } = useSidebar()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <header className="flex items-center gap-3 px-4 h-14 border-b border-border shrink-0">
        <button
          className="md:hidden p-1.5 rounded hover:bg-accent text-muted-foreground"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-9 bg-muted/40 border-border h-8 text-sm"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[11px] text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        <div className="ml-auto">
          <Button size="sm" className="gap-1.5" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            New Item
          </Button>
        </div>
      </header>

      <NewItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        spaces={spaces}
      />
    </>
  )
}
