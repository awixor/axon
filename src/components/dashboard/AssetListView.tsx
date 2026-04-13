"use client";

import { useState, useOptimistic, startTransition } from "react";
import {
  Download,
  FileText,
  FileCode2,
  FileArchive,
  FileImage,
  File,
  BadgeCheck,
  FolderOpen,
} from "lucide-react";
import { type ItemRow, type ItemDetail } from "@/lib/db/items";
import { ItemDrawer } from "@/components/dashboard/ItemDrawer";
import { relativeTime } from "@/lib/utils/time";

// ─── Design tokens ─────────────────────────────────────────────────────────

const ASSET_ACCENT = "#94a3b8";

type FileIconConfig = {
  Icon: React.ElementType;
  color: string;
  bgColor: string;
};

function getIconConfig(mimeType: string): FileIconConfig {
  if (mimeType.startsWith("image/"))
    return {
      Icon: FileImage,
      color: "#60a5fa",
      bgColor: "rgba(96,165,250,0.08)",
    };
  if (
    mimeType.startsWith("text/") ||
    mimeType.includes("json") ||
    mimeType.includes("xml") ||
    mimeType.includes("javascript") ||
    mimeType.includes("typescript")
  )
    return {
      Icon: FileCode2,
      color: "#34d399",
      bgColor: "rgba(52,211,153,0.08)",
    };
  if (
    mimeType.includes("zip") ||
    mimeType.includes("tar") ||
    mimeType.includes("gzip") ||
    mimeType.includes("rar") ||
    mimeType.includes("7z")
  )
    return {
      Icon: FileArchive,
      color: "#fbbf24",
      bgColor: "rgba(251,191,36,0.08)",
    };
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("word") ||
    mimeType.includes("sheet") ||
    mimeType.includes("presentation")
  )
    return {
      Icon: FileText,
      color: "#f87171",
      bgColor: "rgba(248,113,113,0.08)",
    };
  return { Icon: File, color: ASSET_ACCENT, bgColor: "rgba(148,163,184,0.08)" };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Column header ─────────────────────────────────────────────────────────

function ListHeader() {
  return (
    <div
      className="hidden sm:grid items-center px-3 pb-2 border-b border-border/60"
      style={{ gridTemplateColumns: "2.5rem 1fr 5.5rem 6rem 6rem" }}
    >
      <span />
      <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-muted-foreground/50 pl-6.5">
        Name
      </span>
      <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-muted-foreground/50 text-center">
        Size
      </span>
      <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-muted-foreground/50 text-center">
        Modified
      </span>
      <span />
    </div>
  );
}

// ─── Single row ────────────────────────────────────────────────────────────

type RowProps = {
  item: ItemRow;
  selected: boolean;
  onClick: () => void;
};

function AssetRow({ item, selected, onClick }: RowProps) {
  const meta = item.assetMeta;
  const proxyUrl = meta ? `/api/files/${meta.fileKey}` : null;
  const isImage = meta?.mimeType.startsWith("image/") ?? false;
  const { Icon, color, bgColor } = getIconConfig(
    meta?.mimeType ?? "application/octet-stream",
  );

  return (
    <div
      role="row"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-selected={selected}
      className="group relative cursor-pointer border-b border-border/40 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
      style={{
        backgroundColor: selected ? "rgba(148,163,184,0.07)" : undefined,
        borderLeft: `2px solid ${selected ? ASSET_ACCENT : "transparent"}`,
      }}
    >
      {/* Hover layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        style={{ backgroundColor: "rgba(255,255,255,0.022)" }}
      />

      {/* ── Desktop layout ── */}
      <div
        className="relative hidden sm:grid items-center px-3 py-2.5 gap-3"
        style={{ gridTemplateColumns: "2.5rem 1fr 5.5rem 6rem 6rem" }}
      >
        {/* Thumbnail / icon */}
        <div
          className="size-10 rounded overflow-hidden flex items-center justify-center shrink-0"
          style={{ backgroundColor: bgColor }}
        >
          {isImage && proxyUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={proxyUrl}
              alt={meta!.fileName}
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <Icon size={15} style={{ color }} />
          )}
        </div>

        {/* Name */}
        <div className="flex items-center gap-2 min-w-0 pl-3">
          <span
            className="text-sm font-mono truncate"
            style={{ color: selected ? "hsl(var(--foreground))" : undefined }}
          >
            {meta?.fileName ?? item.title}
          </span>
          {item.isVerified && (
            <BadgeCheck
              size={12}
              className="shrink-0 text-emerald-400"
              aria-label="Verified"
            />
          )}
        </div>

        {/* Size */}
        <span className="text-[11px] font-mono text-muted-foreground text-right tabular-nums">
          {meta ? formatBytes(meta.fileSize) : "—"}
        </span>

        {/* Modified */}
        <span className="text-[11px] font-mono text-muted-foreground text-right tabular-nums">
          {relativeTime(item.updatedAt)}
        </span>

        {/* Download */}
        <div className="flex justify-end">
          {proxyUrl && (
            <a
              href={proxyUrl}
              download={meta!.fileName}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Download ${meta!.fileName}`}
              className="flex items-center gap-1 rounded px-1.5 py-1 text-[10px] font-mono text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/60 transition-all duration-150 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <Download size={11} />
              <span>Download</span>
            </a>
          )}
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="relative flex sm:hidden items-center gap-3 px-3 py-3">
        {/* Icon / thumbnail */}
        <div
          className="size-10 rounded overflow-hidden flex items-center justify-center shrink-0"
          style={{ backgroundColor: bgColor }}
        >
          {isImage && proxyUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={proxyUrl}
              alt={meta!.fileName}
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <Icon size={15} style={{ color }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm font-mono truncate">
              {meta?.fileName ?? item.title}
            </span>
            {item.isVerified && (
              <BadgeCheck size={11} className="shrink-0 text-emerald-400" />
            )}
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/60 tabular-nums">
            {meta ? formatBytes(meta.fileSize) : ""} ·{" "}
            {relativeTime(item.updatedAt)}
          </span>
        </div>

        {proxyUrl && (
          <a
            href={proxyUrl}
            download={meta!.fileName}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Download ${meta!.fileName}`}
            className="shrink-0 flex items-center justify-center size-9 rounded text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/60 transition-colors duration-150"
          >
            <Download size={14} />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div
        className="flex items-center justify-center size-14 rounded"
        style={{
          backgroundColor: "rgba(148,163,184,0.08)",
          border: `1px solid rgba(148,163,184,0.15)`,
        }}
      >
        <FolderOpen size={22} style={{ color: ASSET_ACCENT }} />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-mono text-muted-foreground">{message}</p>
        <p className="text-[11px] font-mono text-muted-foreground/40">
          Architecture diagrams, design files, exported PDFs
        </p>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────

type Props = {
  items: ItemRow[];
  emptyMessage?: string;
};

export function AssetListView({
  items,
  emptyMessage = "No assets found.",
}: Props) {
  const [optimisticItems, removeOptimisticItem] = useOptimistic(
    items,
    (current, deletedId: string) => current.filter((i) => i.id !== deletedId),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [itemDetail, setItemDetail] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  async function handleRowClick(id: string) {
    setSelectedId(id);
    setDrawerOpen(true);
    setLoading(true);
    setItemDetail(null);
    setFetchError(false);
    try {
      const res = await fetch(`/api/items/${id}`);
      if (res.ok) {
        setItemDetail((await res.json()) as ItemDetail);
      } else {
        setFetchError(true);
      }
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(open: boolean) {
    setDrawerOpen(open);
    if (!open) {
      setSelectedId(null);
      setItemDetail(null);
    }
  }

  function handleItemDeleted(itemId: string) {
    startTransition(() => {
      removeOptimisticItem(itemId);
    });
  }

  if (optimisticItems.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <>
      <div role="table" aria-label="Asset files">
        <ListHeader />
        <div role="rowgroup">
          {optimisticItems.map((item) => (
            <AssetRow
              key={item.id}
              item={item}
              selected={item.id === selectedId}
              onClick={() => handleRowClick(item.id)}
            />
          ))}
        </div>
      </div>

      <ItemDrawer
        key={selectedId ?? "drawer"}
        open={drawerOpen}
        onOpenChange={handleOpenChange}
        item={itemDetail}
        loading={loading}
        error={fetchError}
        onItemSaved={(updated) => setItemDetail(updated)}
        onItemDeleted={handleItemDeleted}
      />
    </>
  );
}
