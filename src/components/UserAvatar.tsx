import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserAvatar({
  name,
  image,
  className,
}: {
  name?: string | null;
  image?: string | null;
  className?: string;
}) {
  const initials = name ? getInitials(name) : "?";

  if (image) {
    return (
      <img
        src={image}
        alt={name ?? "User avatar"}
        className={cn(
          "size-7 rounded-full object-cover",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0 select-none",
        className,
      )}
    >
      {initials}
    </div>
  );
}
