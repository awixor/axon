"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { type ItemDetail } from "@/lib/db/items";
import { cn } from "@/lib/utils";

// ─── Edit form ────────────────────────────────────────────────────────────────

export type EditFormProps = {
  item: ItemDetail;
  title: string;
  content: string;
  language: string;
  url: string;
  notes: string;
  onTitleChange: (v: string) => void;
  onContentChange: (v: string) => void;
  onLanguageChange: (v: string) => void;
  onUrlChange: (v: string) => void;
  onNotesChange: (v: string) => void;
};

export function EditForm({
  item,
  title,
  content,
  language,
  url,
  notes,
  onTitleChange,
  onContentChange,
  onLanguageChange,
  onUrlChange,
  onNotesChange,
}: EditFormProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Title — all types */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          autoFocus
          className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="Item title"
        />
      </div>

      {/* SNIPPET: language + code */}
      {item.type === "SNIPPET" && (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Language
            </label>
            <input
              type="text"
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="e.g. typescript, python, sql"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Code
            </label>
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              rows={12}
              className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              placeholder="Paste your code here…"
            />
          </div>
        </>
      )}

      {/* RESOURCE: URL + notes */}
      {item.type === "RESOURCE" && (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="https://…"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={6}
              className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              placeholder="Optional notes…"
            />
          </div>
        </>
      )}

      {/* RUNBOOK, DOC, SECRET_REF, BLUEPRINT: content textarea */}
      {(item.type === "RUNBOOK" ||
        item.type === "DOC" ||
        item.type === "SECRET_REF" ||
        item.type === "BLUEPRINT") && (
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            rows={14}
            className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            placeholder="Enter content…"
          />
        </div>
      )}

      {/* ASSET: read-only note */}
      {item.type === "ASSET" && (
        <div className="rounded-md border border-border bg-muted/20 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            File replacement is not supported yet. Only the title can be
            updated.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Action button ────────────────────────────────────────────────────────────

export type ActionBtnProps = {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  className?: string;
};

export function ActionBtn({ children, onClick, label, className }: ActionBtnProps) {
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

// ─── Drawer skeleton ──────────────────────────────────────────────────────────

export function DrawerSkeleton() {
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
