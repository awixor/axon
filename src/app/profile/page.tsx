import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { CalendarDays, Layers, Package } from "lucide-react";
import { getProfileData } from "@/lib/db/users";
import { TYPE_CONFIG, ITEM_TYPES } from "@/lib/type-config";
import { UserAvatar } from "@/components/UserAvatar";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";

export const metadata = { title: "Profile - Axon" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default async function ProfilePage() {
  const session = await getSession();

  if (!session?.user?.id) redirect("/login");

  const profile = await getProfileData(session.user.id);

  if (!profile) redirect("/login");

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* User info */}
        <div className="rounded-lg border border-border bg-card p-6 flex items-start gap-5">
          <UserAvatar name={profile.name} image={profile.image} className="size-14 text-base" />
          <div className="flex-1 min-w-0 space-y-1">
            <h1 className="text-lg font-bold tracking-tight truncate">
              {profile.name}
            </h1>
            <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
            <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
              <CalendarDays size={12} />
              <span>Member since {formatDate(profile.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Usage
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">Total Items</span>
                <Package size={14} className="text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold tabular-nums">{profile.totalItems}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">Spaces</span>
                <Layers size={14} className="text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold tabular-nums">{profile.totalSpaces}</p>
            </div>
          </div>
        </div>

        {/* Type breakdown */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Items by type
          </h2>
          <div className="rounded-lg border border-border bg-card divide-y divide-border">
            {ITEM_TYPES.map((type) => {
              const { label, icon: Icon, color } = TYPE_CONFIG[type];
              const count = profile.itemCountsByType[type] ?? 0;
              return (
                <div key={type} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Icon size={14} style={{ color }} />
                    <span className="text-sm">{label}</span>
                  </div>
                  <span className="text-sm font-medium tabular-nums text-muted-foreground">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Change password */}
        {profile.hasPassword && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Change password
            </h2>
            <div className="rounded-lg border border-border bg-card p-6">
              <ChangePasswordForm />
            </div>
          </div>
        )}

        {/* Danger zone */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Danger zone
          </h2>
          <div className="rounded-lg border border-border bg-card p-6 space-y-2">
            <p className="text-sm font-medium">Delete account</p>
            <p className="text-xs text-muted-foreground mb-4">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <DeleteAccountDialog />
          </div>
        </div>
      </div>
    </div>
  );
}
