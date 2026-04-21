"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Copy,
  Pencil,
  Pin,
  Save,
  Star,
  Trash2,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { type ItemDetail } from "@/lib/db/items";
import { type SpaceOption } from "@/lib/db/spaces";
import { TYPE_CONFIG } from "@/lib/type-config";
import { ItemContent } from "@/components/dashboard/ItemContent";
import { relativeTime } from "@/lib/utils/time";
import { extractCopyText } from "@/lib/utils/copy";
import { updateItem, deleteItem } from "@/actions/items";
import { toast } from "sonner";
import {
  ActionBtn,
  DeleteItemDialog,
  DrawerSkeleton,
  EditForm,
} from "@/components/dashboard/ItemDrawerComponents";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ItemDetail | null;
  loading: boolean;
  error?: boolean;
  spaces?: SpaceOption[];
  onItemSaved?: (item: ItemDetail) => void;
  onItemDeleted?: (itemId: string) => void;
};

export function ItemDrawer({
  open,
  onOpenChange,
  item,
  loading,
  error,
  spaces = [],
  onItemSaved,
  onItemDeleted,
}: Props) {
  const router = useRouter();
  const [starred, setStarred] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editLanguage, setEditLanguage] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editSpaceIds, setEditSpaceIds] = useState<string[]>([]);

  const config = item ? TYPE_CONFIG[item.type] : null;
  const Icon = config?.icon;

  function handleCopy() {
    if (!item) return;
    navigator.clipboard.writeText(extractCopyText(item.type, item.content));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function enterEditMode() {
    if (!item) return;
    setEditTitle(item.title);
    setEditContent(item.content);
    setEditLanguage(item.language ?? "");

    if (item.type === "RESOURCE") {
      const lines = item.content.split("\n");
      const urlLine = lines.find((l) => l.startsWith("URL:"));
      const parsedUrl = urlLine?.replace(/^URL:\s*/, "").trim() ?? "";
      const parsedNotes = lines
        .filter((l) => !l.startsWith("URL:"))
        .join("\n")
        .trim();
      setEditUrl(parsedUrl);
      setEditNotes(parsedNotes);
    }

    setEditSpaceIds(item.spaces.map((s) => s.id));
    setEditMode(true);
  }

  function toggleEditSpace(id: string) {
    setEditSpaceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  async function handleDelete() {
    if (!item) return;
    setDeleting(true);
    const result = await deleteItem(item.id);
    setDeleting(false);
    if (result.success) {
      toast.success("Item deleted");
      setDeleteDialogOpen(false);
      onItemDeleted?.(item.id);
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(
        typeof result.error === "string"
          ? result.error
          : "Failed to delete item",
      );
    }
  }

  async function handleSave() {
    if (!item || !editTitle.trim()) return;
    setSaving(true);

    const result = await updateItem(item.id, {
      type: item.type,
      title: editTitle,
      content: editContent,
      language: editLanguage || null,
      url: editUrl || null,
      notes: editNotes || null,
      spaceIds: editSpaceIds,
    });

    setSaving(false);

    if (result.success) {
      toast.success("Item saved");
      setEditMode(false);
      onItemSaved?.(result.data);
      router.refresh();
    } else {
      const msg =
        typeof result.error === "string"
          ? result.error
          : ((Object.values(result.error).flat()[0] as string) ??
            "Failed to save item");
      toast.error(msg);
    }
  }

  function renderBody() {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center flex-1 gap-2 p-8 text-center">
          <p className="text-sm font-medium">Failed to load item</p>
          <p className="text-xs text-muted-foreground">Please try again.</p>
        </div>
      );
    }

    if (loading || !item) {
      return <DrawerSkeleton />;
    }

    const titleClass = editMode
      ? "sr-only"
      : "text-base font-semibold leading-snug pr-6";

    return (
      <>
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border gap-2">
          {/* Top row: type badge + verified */}
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

          {/* Title */}
          <SheetTitle className={titleClass}>
            {editMode ? `Edit: ${item.title}` : item.title}
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

          {/* Action buttons — view mode only */}
          {!editMode && (
            <div className="flex items-center gap-0.5 pt-1">
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

              <ActionBtn
                onClick={handleCopy}
                label={copied ? "Copied!" : "Copy"}
              >
                <Copy size={15} />
              </ActionBtn>

              <ActionBtn onClick={enterEditMode} label="Edit">
                <Pencil size={15} />
              </ActionBtn>

              <div className="flex-1" />

              <ActionBtn
                onClick={() => setDeleteDialogOpen(true)}
                label="Delete"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 size={15} />
              </ActionBtn>
            </div>
          )}

          {/* Save / Cancel — edit mode only */}
          {editMode && (
            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={() => setEditMode(false)}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X size={13} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!editTitle.trim() || saving}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={13} />
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          )}
        </SheetHeader>

        {/* Content / Edit form */}
        <div className="flex-1 overflow-y-auto px-5 py-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
          {editMode ? (
            <EditForm
              item={item}
              title={editTitle}
              content={editContent}
              language={editLanguage}
              url={editUrl}
              notes={editNotes}
              spaces={spaces}
              selectedSpaceIds={editSpaceIds}
              onTitleChange={setEditTitle}
              onContentChange={setEditContent}
              onLanguageChange={setEditLanguage}
              onUrlChange={setEditUrl}
              onNotesChange={setEditNotes}
              onSpaceToggle={toggleEditSpace}
            />
          ) : (
            <ItemContent item={item} />
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <DeleteItemDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemTitle={item?.title}
        deleting={deleting}
        onDelete={handleDelete}
      />
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          showCloseButton={true}
          className="w-full sm:max-w-3xl flex flex-col gap-0 p-0"
        >
          {renderBody()}
        </SheetContent>
      </Sheet>
    </>
  );
}
