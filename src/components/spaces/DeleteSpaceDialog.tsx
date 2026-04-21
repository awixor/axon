"use client";

import { useTransition } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteSpace } from "@/actions/spaces";

type DeleteSpaceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  space: { id: string; name: string };
  onDeleted?: () => void;
};

export function DeleteSpaceDialog({
  open,
  onOpenChange,
  space,
  onDeleted,
}: DeleteSpaceDialogProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteSpace(space.id);
      if (result.success) {
        toast.success("Space deleted");
        onOpenChange(false);
        onDeleted?.();
      } else {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to delete space",
        );
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm" className="max-w-xs gap-0 p-0 overflow-hidden">
        {/* Destructive accent bar */}
        <div className="h-0.5 w-full bg-destructive/60" />

        <div className="p-5">
          <AlertDialogHeader className="text-left place-items-start gap-3">
            {/* Icon */}
            <div className="size-10 rounded-xl border border-destructive/25 bg-destructive/10 flex items-center justify-center shrink-0">
              <Trash2 size={16} className="text-destructive" />
            </div>

            <div className="space-y-1.5">
              <AlertDialogTitle className="text-sm font-semibold tracking-tight">
                Delete Space
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Permanently remove{" "}
                <span className="inline-flex items-center font-mono text-[11px] bg-muted border border-border px-1.5 py-px rounded text-foreground font-medium tracking-tight">
                  {space.name}
                </span>
                {" "}— items stay in your library, just unlinked from this space.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter className="px-4 pb-4 pt-0 border-t-0 bg-transparent mx-0 mb-0 rounded-none flex flex-row gap-2 justify-end">
          <AlertDialogCancel
            disabled={isPending}
            className="cursor-pointer h-8 px-3 text-xs rounded-lg border border-border bg-transparent hover:bg-accent transition-colors"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
            className="cursor-pointer h-8 px-3 text-xs rounded-lg bg-destructive border border-destructive/80 text-destructive-foreground hover:bg-destructive/85 transition-colors min-w-24 inline-flex items-center justify-center gap-1.5"
          >
            {isPending ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 size={12} />
                Delete Space
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
