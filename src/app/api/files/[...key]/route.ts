import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/auth";
import { r2, R2_BUCKET, isSafeInline } from "@/lib/r2";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teamId = session.user.teamId;
  if (!teamId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { key: segments } = await params;
  const key = segments.join("/");

  const item = await prisma.item.findFirst({
    where: { fileUrl: key, teamId, deletedAt: null },
    select: { id: true },
  });
  if (!item) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const command = new GetObjectCommand({ Bucket: R2_BUCKET, Key: key });
    const object = await r2.send(command);

    if (!object.Body) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const contentType = object.ContentType ?? "application/octet-stream";
    const storedDisposition = object.ContentDisposition ?? "attachment";
    // SVG can execute scripts when rendered inline — always force attachment
    const contentDisposition = isSafeInline(contentType)
      ? storedDisposition
      : storedDisposition.replace(/^inline/, "attachment");
    const stream = object.Body.transformToWebStream();

    return new NextResponse(stream, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
