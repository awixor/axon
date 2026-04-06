"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { getUser } from "@/lib/db/users";
import { updateItem as dbUpdateItem, getItemRawMetadata, softDeleteItem, insertItem } from "@/lib/db/items";
import { ITEM_TYPES } from "@/lib/type-config";

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
  });

export type CreateItemInput = z.input<typeof createItemSchema>;

export async function createItem(data: CreateItemInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Not authenticated" };
  }

  const user = await getUser(session.user.id);
  if (!user?.teamId) {
    return { success: false as const, error: "User not found" };
  }

  const parsed = createItemSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.flatten().fieldErrors,
    };
  }

  const { type, title, content, language, url, notes, secretPairs, spaceIds } =
    parsed.data;

  let finalContent = "";
  let metadata: Record<string, unknown> | null = null;

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
    default:
      finalContent = content ?? "";
      break;
  }

  const item = await insertItem({
    title,
    type,
    content: finalContent,
    metadata,
    authorId: user.id,
    teamId: user.teamId,
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
  })
  .superRefine((data, ctx) => {
    const url = data.url?.trim();
    if (data.type === "RESOURCE" && url) {
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
  });

export type UpdateItemInput = z.infer<typeof updateItemSchema>;

export async function updateItem(itemId: string, data: UpdateItemInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Not authenticated" };
  }

  const user = await getUser(session.user.id);
  if (!user?.teamId) {
    return { success: false as const, error: "User not found" };
  }

  const parsed = updateItemSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.flatten().fieldErrors,
    };
  }

  const { type, title, content, language, url, notes } = parsed.data;

  let finalContent: string | undefined;
  let metadata: { language: string | null } | undefined;

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
    case "SNIPPET": {
      finalContent = content ?? "";
      const existingMeta = await getItemRawMetadata(itemId, user.teamId);
      metadata = { ...existingMeta, language: language?.trim() || null };
      break;
    }
    case "ASSET": {
      // Content not editable for ASSET — only title updates
      finalContent = undefined;
      break;
    }
    default: {
      finalContent = content ?? "";
      break;
    }
  }

  const updated = await dbUpdateItem(itemId, user.teamId, {
    title,
    content: finalContent,
    metadata,
  });

  if (!updated) {
    return { success: false as const, error: "Item not found or update failed" };
  }

  return { success: true as const, data: updated };
}

export async function deleteItem(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Not authenticated" };
  }

  const user = await getUser(session.user.id);
  if (!user?.teamId) {
    return { success: false as const, error: "User not found" };
  }

  const deleted = await softDeleteItem(itemId, user.teamId);
  if (!deleted) {
    return { success: false as const, error: "Item not found or already deleted" };
  }

  return { success: true as const };
}
