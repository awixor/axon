import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getItemById } from "@/lib/db/items";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const teamId = session?.user?.teamId;
  if (!session?.user?.id || !teamId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const item = await getItemById(id, teamId);

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}
