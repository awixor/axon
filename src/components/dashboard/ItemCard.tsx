import { BadgeCheck, Pin } from "lucide-react";
import { type ItemRow } from "@/lib/db/items";
import { TYPE_CONFIG } from "@/lib/type-config";
import { relativeTime } from "@/lib/utils/time";

type Props = {
  item: ItemRow;
  onClick?: () => void;
  selected?: boolean;
};

export function ItemCard({ item, onClick, selected }: Props) {
  const config = TYPE_CONFIG[item.type];
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={`relative rounded-lg border bg-card overflow-hidden hover:border-border/60 transition-colors cursor-pointer ${selected ? "border-border/60 ring-1 ring-border/30" : "border-border"}`}
    >
      {/* Corner glow */}
      <div
        className="absolute bottom-0 right-0 w-28 h-28 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 100% 100%, ${config.color}2e, transparent 65%)`,
        }}
      />
      <div className="relative p-4 flex flex-col min-h-40">
        {/* Type badge */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Icon size={12} style={{ color: config.color }} />
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: config.color }}
            >
              {config.label}
            </span>
          </div>
          {item.isPinned && <Pin size={11} className="text-muted-foreground" />}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm leading-snug mb-2">
          {item.title}
        </h3>

        {/* Content preview */}
        <p className="text-xs text-muted-foreground font-mono leading-relaxed line-clamp-3 flex-1 mb-3">
          {item.content}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {item.isVerified && (
            <span className="flex items-center gap-1 text-emerald-400 shrink-0">
              <BadgeCheck size={11} />
              Verified
            </span>
          )}
          <span className="ml-auto truncate">
            {item.authorName} · {relativeTime(item.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
