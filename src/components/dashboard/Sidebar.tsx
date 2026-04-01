"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Code2,
  FileText,
  Globe,
  Layout,
  LayoutDashboard,
  Paperclip,
  Search,
  Settings,
  ShieldCheck,
  Terminal,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { currentUser } from "@/lib/mock-data";
import { type SpaceRow } from "@/lib/db/spaces";
import { useSidebar } from "./SidebarContext";

const ITEM_TYPES = [
  { label: "Snippets", href: "/items/snippets", icon: Code2, color: "#60a5fa" },
  {
    label: "Runbooks",
    href: "/items/runbooks",
    icon: Terminal,
    color: "#f87171",
  },
  {
    label: "Secrets",
    href: "/items/secrets",
    icon: ShieldCheck,
    color: "#fbbf24",
  },
  { label: "Docs", href: "/items/docs", icon: FileText, color: "#a78bfa" },
  {
    label: "Resources",
    href: "/items/resources",
    icon: Globe,
    color: "#34d399",
  },
  { label: "Assets", href: "/items/assets", icon: Paperclip, color: "#94a3b8" },
  {
    label: "Blueprints",
    href: "/items/blueprints",
    icon: Layout,
    color: "#6366f1",
  },
];

const BOTTOM_NAV = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Team", href: "/team", icon: Users },
];

function NavItem({
  href,
  icon: Icon,
  label,
  collapsed,
  iconStyle,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
  iconStyle?: React.CSSProperties;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-2.5 mx-1.5 px-2 py-1.5 text-sm text-sidebar-foreground rounded hover:bg-sidebar-accent",
        collapsed && "justify-center px-0 mx-1",
      )}
    >
      <Icon size={15} style={iconStyle} className="shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

function Section({
  label,
  icon,
  collapsed,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  collapsed: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3">
      {!collapsed && (
        <p className="flex items-center gap-1 px-3 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
          {icon}
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

function SpaceItem({
  space,
  collapsed,
}: {
  space: SpaceRow;
  collapsed: boolean;
}) {
  return (
    <Link
      href={`/spaces/${space.id}`}
      title={collapsed ? space.name : undefined}
      className={cn(
        "flex items-center gap-2 mx-1.5 px-2 py-1.5 text-sm text-sidebar-foreground rounded hover:bg-sidebar-accent",
        collapsed && "justify-center px-0 mx-1",
      )}
    >
      <span
        className={cn(
          "shrink-0 rounded-full",
          collapsed ? "size-2.5" : "size-2",
        )}
        style={{ backgroundColor: space.color }}
      />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{space.name}</span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {space.itemCount}
          </span>
        </>
      )}
    </Link>
  );
}

function SidebarInner({
  isMobile = false,
  spaces,
}: {
  isMobile?: boolean;
  spaces: SpaceRow[];
}) {
  const { collapsed, setCollapsed, setMobileOpen } = useSidebar();
  const [spaceSearch, setSpaceSearch] = useState("");

  const isCollapsed = isMobile ? false : collapsed;

  const filteredSpaces = spaceSearch
    ? spaces.filter((s) =>
        s.name.toLowerCase().includes(spaceSearch.toLowerCase()),
      )
    : spaces;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center h-14 px-3 border-b border-sidebar-border shrink-0">
        {!isCollapsed && (
          <span className="font-semibold text-sm flex-1 tracking-tight">
            Axon
          </span>
        )}
        {isMobile ? (
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto p-1.5 rounded hover:bg-sidebar-accent text-sidebar-foreground"
            aria-label="Close menu"
          >
            <X size={15} />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "p-1.5 rounded hover:bg-sidebar-accent text-sidebar-foreground",
              isCollapsed && "mx-auto",
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight size={15} />
            ) : (
              <ChevronLeft size={15} />
            )}
          </button>
        )}
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        {/* Space search */}
        {!isCollapsed && (
          <div className="px-2 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search spaces..."
                value={spaceSearch}
                onChange={(e) => setSpaceSearch(e.target.value)}
                className="h-7 text-xs pl-8 bg-sidebar-accent/40 border-sidebar-border"
              />
            </div>
          </div>
        )}

        {/* All Items */}
        <NavItem
          href="/dashboard"
          icon={LayoutDashboard}
          label="All Items"
          collapsed={isCollapsed}
        />

        {/* Spaces */}
        <Section
          label="SPACES"
          icon={<Layout size={10} />}
          collapsed={isCollapsed}
        >
          {filteredSpaces?.map((space) => (
            <SpaceItem key={space.id} space={space} collapsed={isCollapsed} />
          ))}
          {!isCollapsed && (
            <Link
              href="/spaces"
              className="flex items-center gap-2 mx-1.5 px-2 py-1.5 text-xs text-muted-foreground rounded hover:bg-sidebar-accent"
            >
              View all spaces
            </Link>
          )}
        </Section>

        <div className="border-t border-sidebar-border my-2" />

        {/* Item Types */}
        <Section
          label="TYPES"
          icon={<Layout size={10} />}
          collapsed={isCollapsed}
        >
          {ITEM_TYPES.map(({ label, href, icon, color }) => (
            <NavItem
              key={href}
              href={href}
              icon={icon}
              label={label}
              collapsed={isCollapsed}
              iconStyle={{ color }}
            />
          ))}
        </Section>
      </div>

      {/* Bottom */}
      <div className="border-t border-sidebar-border pt-1 pb-1">
        {BOTTOM_NAV.map(({ label, href, icon }) => (
          <NavItem
            key={href}
            href={href}
            icon={icon}
            label={label}
            collapsed={isCollapsed}
          />
        ))}

        {/* User area */}
        <div
          className={cn(
            "flex items-center gap-2.5 mx-1.5 px-2 py-2 mt-0.5",
            isCollapsed && "justify-center px-0 mx-1",
          )}
        >
          <div className="size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0 select-none">
            {currentUser.avatarInitials}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium leading-tight truncate">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight truncate">
                {currentUser.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DesktopSidebar({ spaces }: { spaces: SpaceRow[] }) {
  const { collapsed } = useSidebar();
  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-full bg-sidebar border-r border-sidebar-border shrink-0 transition-[width] duration-200 overflow-hidden",
        collapsed ? "w-13" : "w-64",
      )}
    >
      <SidebarInner spaces={spaces} />
    </aside>
  );
}

function MobileDrawer({ spaces }: { spaces: SpaceRow[] }) {
  const { setMobileOpen } = useSidebar();
  return (
    <div className="md:hidden fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-black/60"
        onClick={() => setMobileOpen(false)}
      />
      <aside className="relative flex flex-col w-72 h-full bg-sidebar border-r border-sidebar-border">
        <SidebarInner isMobile spaces={spaces} />
      </aside>
    </div>
  );
}

export function Sidebar({ spaces }: { spaces: SpaceRow[] }) {
  const { mobileOpen } = useSidebar();
  return (
    <>
      <DesktopSidebar spaces={spaces} />
      {mobileOpen && <MobileDrawer spaces={spaces} />}
    </>
  );
}
