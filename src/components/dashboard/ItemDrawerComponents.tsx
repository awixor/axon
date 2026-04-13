import { Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { type ItemDetail } from "@/lib/db/items";
import { cn } from "@/lib/utils";
import { CodeEditor } from "@/components/ui/code-editor";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
            <CodeEditor
              value={content}
              language={language}
              onChange={onContentChange}
              minHeight="200px"
              maxHeight="400px"
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
            <MarkdownEditor
              value={notes}
              onChange={onNotesChange}
              minHeight="120px"
              maxHeight="300px"
              placeholder="Optional notes…"
            />
          </div>
        </>
      )}

      {/* RUNBOOK, DOC, BLUEPRINT: markdown editor */}
      {(item.type === "RUNBOOK" ||
        item.type === "DOC" ||
        item.type === "BLUEPRINT") && (
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Content
          </label>
          <MarkdownEditor
            value={content}
            onChange={onContentChange}
            itemType={item.type}
            minHeight="200px"
            maxHeight="400px"
          />
        </div>
      )}

      {/* SECRET_REF: plain textarea */}
      {item.type === "SECRET_REF" && (
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

export function ActionBtn({
  children,
  onClick,
  label,
  className,
}: ActionBtnProps) {
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

// ─── Delete confirmation dialog ───────────────────────────────────────────────

type DeleteItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemTitle: string | undefined;
  deleting: boolean;
  onDelete: () => void;
};

export function DeleteItemDialog({
  open,
  onOpenChange,
  itemTitle,
  deleting,
  onDelete,
}: DeleteItemDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        size="sm"
        className="gap-5 p-5 bg-background border border-border/60 shadow-2xl"
      >
        <AlertDialogHeader className="gap-3">
          <AlertDialogMedia className="size-10 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            <Trash2 size={18} />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-sm font-semibold tracking-tight">
            Delete item
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-mono text-foreground/80 bg-muted px-1.5 py-0.5 rounded text-[11px] break-all">
              {itemTitle}
            </span>{" "}
            will be permanently deleted. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={deleting} className="text-xs h-8">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={deleting}
            className="text-xs h-8 bg-destructive text-white hover:bg-destructive/90 border-0 shadow-none"
          >
            {deleting ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
