import { cn } from "@/lib/utils";

export function FilterTab({
  active,
  onClick,
  label,
  count,
  icon: Icon,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  icon?: React.ElementType;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer",
        active
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
      )}
    >
      {Icon && <Icon size={12} style={active ? { color } : undefined} />}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            "tabular-nums",
            active ? "text-foreground" : "text-muted-foreground/70",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
