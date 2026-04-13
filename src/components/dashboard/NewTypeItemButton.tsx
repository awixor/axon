"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TYPE_CONFIG } from "@/lib/type-config";
import { NewItemDialog } from "@/components/dashboard/NewItemDialog";
import type { ItemType } from "@/types/items";
import type { SpaceOption } from "@/lib/db/spaces";

type Props = {
  itemType: ItemType;
  spaces: SpaceOption[];
};

export function NewTypeItemButton({ itemType, spaces }: Props) {
  const [open, setOpen] = useState(false);
  const config = TYPE_CONFIG[itemType];
  const Icon = config.icon;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
      >
        <Icon size={13} style={{ color: config.color }} />
        New {config.label}
        <Plus size={12} className="ml-0.5" />
      </button>

      <NewItemDialog
        open={open}
        onOpenChange={setOpen}
        spaces={spaces}
        defaultType={itemType}
      />
    </>
  );
}
