import Link from "next/link";
import { ArrowRight, Folder } from "lucide-react";
import { type SpaceRow } from "@/lib/db/spaces";

export function SpaceCard({ space }: { space: SpaceRow }) {
  return (
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
        {/* Icon + arrow row */}
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
          <div className="size-7 rounded-full border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight size={12} style={{ color: space.color }} />
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
  );
}
