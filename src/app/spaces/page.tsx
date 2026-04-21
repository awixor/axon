import { getSession } from "@/lib/session";
import { getAllSpacesWithCount } from "@/lib/db/spaces";
import { SpacesGrid } from "@/components/spaces/SpacesGrid";

export default async function SpacesPage() {
  const session = await getSession();
  const teamId = session?.user?.teamId ?? "";
  const spaces = await getAllSpacesWithCount(teamId);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold">Spaces</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {spaces.length} space{spaces.length !== 1 ? "s" : ""}
        </p>
      </div>
      <SpacesGrid spaces={spaces} />
    </div>
  );
}
