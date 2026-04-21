"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditSpaceDialog } from "@/components/spaces/EditSpaceDialog";
import { DeleteSpaceDialog } from "@/components/spaces/DeleteSpaceDialog";
import { type SpaceDetail } from "@/lib/db/spaces";

type Props = { space: SpaceDetail };

export function SpaceHeaderActions({ space }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => setEditOpen(true)}
          aria-label="Edit space"
        >
          <Pencil size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => setDeleteOpen(true)}
          aria-label="Delete space"
        >
          <Trash2 size={14} className="text-destructive" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="Favorite space"
          disabled
        >
          <Star size={14} />
        </Button>
      </div>

      <EditSpaceDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        space={space}
      />
      <DeleteSpaceDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        space={space}
        onDeleted={() => router.push("/spaces")}
      />
    </>
  );
}
