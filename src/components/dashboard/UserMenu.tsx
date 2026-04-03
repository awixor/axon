"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/UserAvatar";
import { type UserRow } from "@/lib/db/users";

export function UserMenu({
  user,
  collapsed,
}: {
  user: UserRow | null;
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-2.5 mx-1.5 px-2 py-2 mt-0.5 rounded hover:bg-sidebar-accent",
          collapsed && "justify-center px-0 mx-1",
        )}
      >
        <UserAvatar name={user?.name} image={user?.image} />
        {!collapsed && (
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-medium leading-tight truncate">
              {user?.name ?? "—"}
            </p>
            <p className="text-[11px] text-muted-foreground leading-tight truncate">
              {user?.email ?? "—"}
            </p>
          </div>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-1.5 mb-1 w-48 rounded-lg border border-border bg-popover p-1 shadow-lg">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
          >
            <User size={14} />
            Profile
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent text-destructive-foreground"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
