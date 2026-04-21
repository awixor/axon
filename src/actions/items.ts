"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { updateItem as dbUpdateItem, getItemForUpdate, softDeleteItem, insertItem } from "@/lib/db/items";
import { ITEM_TYPES } from "@/lib/type-config";
import { deleteR2Object } from "@/lib/r2";

const createItemSchema = z
  .object({
    type: z.enum(ITEM_TYPES),
    title: z.string().trim().min(1, "Title is required"),
    content: z.string().optional().default(""),
    language: z.string().trim().optional().nullable(),
    url: z.string().trim().optional().nullable(),
    notes: z.string().optional().nullable(),
    secretPairs: z
      .array(z.object({ key: z.string().trim(), value: z.string() }))
      .optional()
      .default([]),
    spaceIds: z.array(z.string()).optional().default([]),
    // ASSET-specific
    fileKey: z.string().optional().nullable(),
    fileName: z.string().optional().nullable(),
    fileSize: z.number().optional().nullable(),
    fileMimeType: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "RESOURCE") {
      const url = data.url?.trim();
      if (!url) {
        ctx.addIssue({
          code: "custom",
          message: "URL is required for resources",
          path: ["url"],
        });
      } else {
        try {
          new URL(url);
        } catch {
          ctx.addIssue({
            code: "custom",
            message: "Invalid URL",
            path: ["url"],
          });
        }
      }
    }

    if (
      ["SNIPPET", "RUNBOOK", "DOC", "BLUEPRINT"].includes(data.type) &&
      !data.content?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Content is required",
        path: ["content"],
      });
    }

    if (data.type === "ASSET" && !data.fileKey) {
      ctx.addIssue({
        code: "custom",
        message: "A file is required for assets",
        path: ["fileKey"],
      });
    }
  });

export type CreateItemInput = z.input<typeof createItemSchema>;

export async function createItem(data: CreateItemInput) {
  const session = await auth();
  const userId = session?.user?.id;
  const teamId = session?.user?.teamId;
  if (!userId || !teamId) {
    return { success: false as const, error: "Not authenticated" };
  }

  const parsed = createItemSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.flatten().fieldErrors,
    };
  }

  const {
    type,
    title,
    content,
    language,
    url,
    notes,
    secretPairs,
    spaceIds,
    fileKey,
    fileName,
    fileSize,
    fileMimeType,
  } = parsed.data;

  let finalContent = "";
  let metadata: Record<string, unknown> | null = null;
  let fileUrl: string | null = null;

  switch (type) {
    case "SNIPPET":
      finalContent = content ?? "";
      metadata = { language: language?.trim() || null };
      break;
    case "RESOURCE": {
      const urlVal = url?.trim() ?? "";
      const notesVal = notes?.trim() ?? "";
      finalContent = urlVal
        ? notesVal
          ? `URL: ${urlVal}\n${notesVal}`
          : `URL: ${urlVal}`
        : notesVal;
      metadata = { url: urlVal };
      break;
    }
    case "SECRET_REF":
      finalContent = secretPairs
        .filter((p) => p.key.trim())
        .map((p) => `${p.key.trim()}: ${p.value}`)
        .join("\n");
      break;
    case "ASSET":
      if (!fileKey?.startsWith(`uploads/${userId}/`)) {
        return { success: false as const, error: "Invalid file reference" };
      }
      finalContent = fileName ?? "";
      fileUrl = fileKey ?? null;
      metadata = {
        fileKey: fileKey ?? "",
        fileName: fileName ?? "",
        fileSize: fileSize ?? 0,
        mimeType: fileMimeType ?? "application/octet-stream",
      };
      break;
    default:
      finalContent = content ?? "";
      break;
  }

  const item = await insertItem({
    title,
    type,
    content: finalContent,
    metadata,
    fileUrl,
    authorId: userId,
    teamId,
    spaceIds,
  });

  return { success: true as const, data: item };
}

const updateItemSchema = z
  .object({
    type: z.enum(ITEM_TYPES),
    title: z.string().trim().min(1, "Title is required"),
    content: z.string().optional().nullable(),
    language: z.string().optional().nullable(),
    url: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    spaceIds: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "RESOURCE") {
      const url = data.url?.trim();
      if (!url) {
        ctx.addIssue({
          code: "custom",
          message: "URL is required for resources",
          path: ["url"],
        });
      } else {
        try {
          new URL(url);
        } catch {
          ctx.addIssue({
            code: "custom",
            message: "Invalid URL",
            path: ["url"],
          });
        }
      }
    }
  });

export type UpdateItemInput = z.input<typeof updateItemSchema>;

export async function updateItem(itemId: string, data: UpdateItemInput) {
  const session = await auth();
  const userId = session?.user?.id;
  const teamId = session?.user?.teamId;
  if (!userId || !teamId) {
    return { success: false as const, error: "Not authenticated" };
  }

  const parsed = updateItemSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.flatten().fieldErrors,
    };
  }

  const { title, content, language, url, notes, spaceIds } = parsed.data;
  const type = parsed.data.type;

  let finalContent: string | undefined;
  let metadata: Record<string, unknown> | undefined;

  if (type === "SNIPPET") {
    const existing = await getItemForUpdate(itemId, teamId);
    if (!existing) return { success: false as const, error: "Item not found" };
    finalContent = content ?? "";
    metadata = { ...existing.metadata, language: language?.trim() || null };
  } else {
    switch (type) {
      case "RESOURCE": {
        const urlVal = url?.trim() ?? "";
        const notesVal = notes?.trim() ?? "";
        finalContent = urlVal
          ? notesVal
            ? `URL: ${urlVal}\n${notesVal}`
            : `URL: ${urlVal}`
          : notesVal;
        break;
      }
      case "ASSET": {
        finalContent = undefined;
        break;
      }
      default: {
        finalContent = content ?? "";
        break;
      }
    }
  }

  const updated = await dbUpdateItem(itemId, teamId, {
    title,
    content: finalContent,
    metadata,
    lastEditedById: userId,
    spaceIds,
  });

  if (!updated) {
    return { success: false as const, error: "Item not found or update failed" };
  }

  return { success: true as const, data: updated };
}

export async function deleteItem(itemId: string) {
  const session = await auth();
  const teamId = session?.user?.teamId;
  if (!session?.user?.id || !teamId) {
    return { success: false as const, error: "Not authenticated" };
  }

  const { deleted, fileUrl } = await softDeleteItem(itemId, teamId);
  if (!deleted) {
    return { success: false as const, error: "Item not found or already deleted" };
  }

  if (fileUrl) {
    await deleteR2Object(fileUrl).catch(() => {
      // Non-fatal: item is already soft-deleted
    });
  }

  return { success: true as const };
}
