"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Copy,
  Pencil,
  Pin,
  Star,
  Trash2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { type ItemDetail } from "@/lib/db/items";
import { TYPE_CONFIG } from "@/lib/type-config";
import { ItemContent } from "@/components/dashboard/ItemContent";
import { relativeTime } from "@/lib/utils/time";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ItemDetail | null;
  loading: boolean;
  error?: boolean;
};

export function ItemDrawer({ open, onOpenChange, item, loading, error }: Props) {
  const [starred, setStarred] = useState(false);
  const [copied, setCopied] = useState(false);

  const config = item ? TYPE_CONFIG[item.type] : null;
  const Icon = config?.icon;

  function handleCopy() {
    if (!item) return;
    navigator.clipboard.writeText(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={true}
        className="w-full sm:max-w-lg flex flex-col gap-0 p-0"
      >
        {error ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-2 p-8 text-center">
            <p className="text-sm font-medium">Failed to load item</p>
            <p className="text-xs text-muted-foreground">Please try again.</p>
          </div>
        ) : loading || !item ? (
          <DrawerSkeleton />
        ) : (
          <>
            <SheetHeader className="px-5 pt-5 pb-4 border-b border-border gap-2">
              {/* Type badge row */}
              <div className="flex items-center gap-2">
                {Icon && (
                  <div className="flex items-center gap-1.5">
                    <Icon size={12} style={{ color: config!.color }} />
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: config!.color }}
                    >
                      {config!.label}
                    </span>
                  </div>
                )}
                {item.isVerified && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                    <BadgeCheck size={11} />
                    Verified
                  </span>
                )}
              </div>

              <SheetTitle className="text-base font-semibold leading-snug pr-6">
                {item.title}
              </SheetTitle>

              {/* Meta */}
              <div className="flex flex-col gap-0.5 text-[11px] text-muted-foreground">
                <span>
                  Created by{" "}
                  <span className="text-foreground">{item.authorName}</span>
                </span>
                <span>Updated {relativeTime(item.updatedAt)}</span>
              </div>

              {/* Space tags */}
              {item.spaces.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.spaces.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium"
                      style={{ borderColor: s.color + "50", color: s.color }}
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              )}
            </SheetHeader>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ItemContent item={item} />
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-1 px-4 py-3 border-t border-border">
              <ActionBtn
                onClick={() => setStarred((s) => !s)}
                label="Favorite"
                className={starred ? "text-yellow-400" : ""}
              >
                <Star size={15} fill={starred ? "currentColor" : "none"} />
              </ActionBtn>

              <ActionBtn onClick={() => {}} label="Pin">
                <Pin size={15} />
              </ActionBtn>

              <ActionBtn onClick={handleCopy} label={copied ? "Copied!" : "Copy"}>
                <Copy size={15} />
              </ActionBtn>

              <ActionBtn onClick={() => {}} label="Edit">
                <Pencil size={15} />
              </ActionBtn>

              <div className="flex-1" />

              <ActionBtn
                onClick={() => {}}
                label="Delete"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 size={15} />
              </ActionBtn>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ActionBtn({
  children,
  onClick,
  label,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
        className,
      )}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-1/3" />
      <div className="flex gap-1.5 mt-1">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}
