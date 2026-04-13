import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { r2, R2_BUCKET, isAllowedType, isImage, maxBytes } from "@/lib/r2";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const mimeType = file.type;

  if (!isAllowedType(mimeType)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  if (file.size > maxBytes(mimeType)) {
    const limit = isImage(mimeType) ? "5 MB" : "10 MB";
    return NextResponse.json(
      { error: `File exceeds maximum size of ${limit}` },
      { status: 400 },
    );
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const key = `uploads/${session.user.id}/${randomUUID()}.${ext}`;
  // Strip chars that can break the Content-Disposition header value
  const safeFileName = file.name.replace(/[\r\n"\\]/g, "_");

  const buffer = Buffer.from(await file.arrayBuffer());

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ContentDisposition: `inline; filename="${safeFileName}"`,
    }),
  );

  return NextResponse.json({
    key,
    fileName: file.name,
    fileSize: file.size,
    mimeType,
  });
}
