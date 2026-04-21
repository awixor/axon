import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getItemsByType } from "@/lib/db/items";
import { getAllSpaces } from "@/lib/db/spaces";
import { ITEM_TYPE_BY_SLUG, TYPE_CONFIG } from "@/lib/type-config";
import { ItemsGrid } from "@/components/dashboard/ItemsGrid";
import { AssetListView } from "@/components/dashboard/AssetListView";
import { NewTypeItemButton } from "@/components/dashboard/NewTypeItemButton";

export default async function ItemListPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: slug } = await params;
  const itemType = ITEM_TYPE_BY_SLUG[slug];

  if (!itemType) notFound();

  const session = await getSession();
  const teamId = session?.user?.teamId ?? "";
  const [items, spaces] = await Promise.all([
    getItemsByType(teamId, itemType),
    getAllSpaces(teamId),
  ]);

  const config = TYPE_CONFIG[itemType];
  const Icon = config.icon;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6 flex items-center gap-2.5">
        <Icon size={18} style={{ color: config.color }} />
        <h1 className="text-lg font-semibold">{config.plural}</h1>
        <span className="text-sm text-muted-foreground">({items.length})</span>
        <div className="ml-auto">
          <NewTypeItemButton itemType={itemType} spaces={spaces} />
        </div>
      </div>

      {itemType === "ASSET" ? (
        <AssetListView items={items} spaces={spaces} emptyMessage="No assets yet." />
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No {config.plural.toLowerCase()} yet.</p>
      ) : (
        <ItemsGrid items={items} spaces={spaces} />
      )}
    </div>
  );
}
