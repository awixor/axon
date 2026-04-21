import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Folder } from "lucide-react";
import { getSession } from "@/lib/session";
import { getSpaceById, getAllSpaces } from "@/lib/db/spaces";
import { getItemsBySpaceId } from "@/lib/db/items";
import { SpaceItemsGrid } from "@/components/spaces/SpaceItemsGrid";
import { SpaceHeaderActions } from "@/components/spaces/SpaceHeaderActions";

export default async function SpaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const teamId = session?.user?.teamId ?? "";

  const [space, items, allSpaces] = await Promise.all([
    getSpaceById(id, teamId),
    getItemsBySpaceId(id, teamId),
    getAllSpaces(teamId),
  ]);

  if (!space) notFound();

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <Link
          href="/spaces"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft size={12} />
          All Spaces
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="size-9 rounded-full border-2 flex items-center justify-center shrink-0"
            style={{
              borderColor: space.color + "60",
              backgroundColor: space.color + "18",
            }}
          >
            <Folder size={16} style={{ color: space.color }} />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h1 className="text-lg font-semibold">{space.name}</h1>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums shrink-0"
              style={{
                backgroundColor: space.color + "25",
                color: space.color,
              }}
            >
              {space.itemCount}
            </span>
            <div className="ml-auto">
              <SpaceHeaderActions space={space} />
            </div>
          </div>
        </div>
        {space.description && (
          <p className="text-sm text-muted-foreground mt-2 ml-12">
            {space.description}
          </p>
        )}
      </div>

      <SpaceItemsGrid items={items} spaces={allSpaces} />
    </div>
  );
}
