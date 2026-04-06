"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { getUser } from "@/lib/db/users";
import { updateItem as dbUpdateItem, getItemRawMetadata } from "@/lib/db/items";
import { ITEM_TYPES } from "@/lib/type-config";

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
          code: z.ZodIssueCode.custom,
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
