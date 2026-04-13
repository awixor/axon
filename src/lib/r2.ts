import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID!;

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET = process.env.R2_BUCKET_NAME!;

export async function deleteR2Object(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}

// Allowed MIME types and their max sizes
export const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

export const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "application/x-yaml",
  "text/yaml",
  "application/xml",
  "text/xml",
  "text/csv",
  "application/toml",
]);

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export function isImage(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.has(mimeType);
}

export function isAllowedType(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.has(mimeType) || ALLOWED_FILE_TYPES.has(mimeType);
}

export function maxBytes(mimeType: string): number {
  return isImage(mimeType) ? MAX_IMAGE_BYTES : MAX_FILE_BYTES;
}

// Magic byte signatures for binary formats — text-based types (SVG, JSON, etc.) are omitted
export const MAGIC_BYTES: Record<string, (b: Buffer) => boolean> = {
  "image/png": (b) =>
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/gif": (b) =>
    b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38,
  "image/webp": (b) =>
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50,
  "application/pdf": (b) =>
    b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46,
};

// Types that must always be served as attachment (never rendered inline)
// SVG can execute scripts when rendered inline in a browser tab
export const ATTACHMENT_ONLY_TYPES = new Set(["image/svg+xml"]);

export function isSafeInline(mimeType: string): boolean {
  return mimeType.startsWith("image/") && !ATTACHMENT_ONLY_TYPES.has(mimeType);
}
