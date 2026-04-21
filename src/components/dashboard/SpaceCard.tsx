"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Folder, MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type SpaceRow } from "@/lib/db/spaces";
import { EditSpaceDialog } from "@/components/spaces/EditSpaceDialog";
import { DeleteSpaceDialog } from "@/components/spaces/DeleteSpaceDialog";

export function SpaceCard({ space }: { space: SpaceRow }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const spaceForDialog = {
    id: space.id,
    name: space.name,
    description: space.description,
    color: space.color,
    visibility: "PRIVATE_TO_TEAM" as const,
  };

  return (
    <>
      <Link
        href={`/spaces/${space.id}`}
        className="group relative rounded-lg border border-border bg-card overflow-hidden cursor-pointer transition-colors block"
        style={{ "--space-color": space.color } as React.CSSProperties}
      >
        {/* Corner glow — top left */}
        <div
          className="absolute top-0 left-0 w-28 h-28 pointer-events-none transition-opacity duration-300 opacity-60 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at 0% 0%, ${space.color}2e, transparent 65%)`,
          }}
        />

        {/* Colored underline — expands from center on hover */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
          style={{ backgroundColor: space.color }}
        />

        <div className="p-5">
          {/* Icon + menu row */}
          <div className="flex items-start justify-between mb-4">
            <div
              className="size-11 rounded-full border-2 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
              style={{
                borderColor: space.color + "60",
                backgroundColor: space.color + "18",
              }}
            >
              <Folder size={18} style={{ color: space.color }} />
            </div>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="size-7 rounded-full border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
                  onClick={(e) => e.preventDefault()}
                  aria-label="Space options"
                >
                  <MoreHorizontal size={13} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 p-1.5">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="px-2 py-1 mb-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 truncate">
                      {space.name}
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>

                  <DropdownMenuItem
                    className="px-2 py-1.5 text-xs gap-2.5 rounded-md"
                    onClick={(e) => {
                      e.preventDefault();
                      setEditOpen(true);
                    }}
                  >
                    <Pencil size={12} className="shrink-0" />
                    <span>Edit</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    disabled
                    className="px-2 py-1.5 text-xs gap-2.5 rounded-md"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Star size={12} className="shrink-0" />
                    <span>Favorite</span>
                    <DropdownMenuShortcut className="text-[9px] font-mono">
                      Soon
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1.5 -mx-1" />

                  <DropdownMenuItem
                    variant="destructive"
                    className="px-2 py-1.5 text-xs gap-2.5 rounded-md"
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteOpen(true);
                    }}
                  >
                    <Trash2 size={12} className="shrink-0" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="size-7 rounded-full border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={12} style={{ color: space.color }} />
              </div>
            </div>
          </div>

          {/* Title + count badge */}
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-semibold text-sm leading-snug truncate">
              {space.name}
            </h3>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 tabular-nums"
              style={{
                backgroundColor: space.color + "25",
                color: space.color,
              }}
            >
              {space.itemCount}
            </span>
          </div>

          {/* Description */}
          {space.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {space.description}
            </p>
          )}
        </div>
      </Link>

      <EditSpaceDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        space={spaceForDialog}
      />
      <DeleteSpaceDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        space={space}
      />
    </>
  );
}
