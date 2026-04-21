import { prisma } from "@/lib/prisma";
import type { InputJsonValue } from "@prisma/client/runtime/client";
import { type ItemType } from "@/types/items";

export type AssetMeta = {
  fileKey: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

export type ItemDetail = {
  id: string;
  title: string;
  type: ItemType;
  content: string;
  language?: string;
  assetMeta?: AssetMeta;
  isVerified: boolean;
  authorName: string;
  lastEditedByName: string | null;
  createdAt: string;
  updatedAt: string;
  spaces: { id: string; name: string; color: string }[];
};

export type ItemRow = {
  id: string;
  title: string;
  type: ItemType;
  content: string;
  isVerified: boolean;
  isPinned: boolean;
  authorName: string;
  updatedAt: string; // ISO string — safe to pass to client components
  assetMeta?: AssetMeta; // only present for ASSET items
};

const itemSelect = {
  id: true,
  title: true,
  type: true,
  content: true,
  isVerified: true,
  updatedAt: true,
  author: { select: { name: true } },
} as const;

export type CreateItemFields = {
  title: string;
  type: ItemType;
  content: string;
  metadata?: Record<string, unknown> | null;
  fileUrl?: string | null;
  authorId: string;
  teamId: string;
  spaceIds?: string[];
};

export async function insertItem(fields: CreateItemFields): Promise<ItemRow> {
  return prisma.$transaction(async (tx) => {
    const item = await tx.item.create({
      data: {
        title: fields.title,
        type: fields.type,
        content: fields.content,
        ...(fields.metadata ? { metadata: fields.metadata as InputJsonValue } : {}),
        ...(fields.fileUrl ? { fileUrl: fields.fileUrl } : {}),
        authorId: fields.authorId,
        lastEditedById: fields.authorId,
        teamId: fields.teamId,
      },
      select: itemSelect,
    });

    if (fields.spaceIds?.length) {
      // Verify all space IDs belong to this team before inserting (prevents IDOR)
      const validSpaces = await tx.space.findMany({
        where: { id: { in: fields.spaceIds }, teamId: fields.teamId },
        select: { id: true },
      });
      const validIds = validSpaces.map((s) => s.id);
      if (validIds.length) {
        await tx.itemSpace.createMany({
          data: validIds.map((spaceId) => ({ itemId: item.id, spaceId })),
          skipDuplicates: true,
        });
      }
    }

    return {
      id: item.id,
      title: item.title,
      type: item.type as ItemType,
      content: item.content,
      isVerified: item.isVerified,
      isPinned: false,
      authorName: item.author.name ?? "Unknown",
      updatedAt: item.updatedAt.toISOString(),
    };
  });
}

export async function getRecentItems(
  teamId: string,
  limit: number = 12,
): Promise<ItemRow[]> {
  const items = await prisma.item.findMany({
    where: { teamId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: itemSelect,
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    type: item.type as ItemType,
    content: item.content,
    isVerified: item.isVerified,
    isPinned: false,
    authorName: item.author.name ?? "Unknown",
    updatedAt: item.updatedAt.toISOString(),
  }));
}

export async function getPinnedItems(teamId: string): Promise<ItemRow[]> {
  const items = await prisma.item.findMany({
    where: {
      teamId,
      deletedAt: null,
      spaces: { some: { pinned: true } },
    },
    orderBy: { updatedAt: "desc" },
    select: itemSelect,
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    type: item.type as ItemType,
    content: item.content,
    isVerified: item.isVerified,
    isPinned: true,
    authorName: item.author.name ?? "Unknown",
    updatedAt: item.updatedAt.toISOString(),
  }));
}

export async function getItemsByType(
  teamId: string,
  type: ItemType,
): Promise<ItemRow[]> {
  const isAsset = type === "ASSET";
  const items = await prisma.item.findMany({
    where: { teamId, type, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    select: {
      ...itemSelect,
      ...(isAsset ? { metadata: true } : {}),
    },
  });

  return items.map((item) => {
    const meta = isAsset
      ? (item as typeof item & { metadata: Record<string, unknown> | null })
          .metadata
      : null;

    let assetMeta: AssetMeta | undefined;
    if (isAsset && meta?.fileKey) {
      assetMeta = {
        fileKey: meta.fileKey as string,
        fileName: (meta.fileName as string) ?? "",
        fileSize: (meta.fileSize as number) ?? 0,
        mimeType: (meta.mimeType as string) ?? "application/octet-stream",
      };
    }

    return {
      id: item.id,
      title: item.title,
      type: item.type as ItemType,
      content: item.content,
      isVerified: item.isVerified,
      isPinned: false,
      authorName: item.author.name ?? "Unknown",
      updatedAt: item.updatedAt.toISOString(),
      ...(assetMeta ? { assetMeta } : {}),
    };
  });
}

export async function getItemById(
  id: string,
  teamId: string,
): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: { id, teamId, deletedAt: null },
    select: {
      id: true,
      title: true,
      type: true,
      content: true,
      metadata: true,
      fileUrl: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { name: true } },
      lastEditedBy: { select: { name: true } },
      spaces: {
        select: {
          space: { select: { id: true, name: true, color: true } },
        },
      },
    },
  });

  if (!item) return null;

  const meta = item.metadata as Record<string, unknown> | null;

  let assetMeta: AssetMeta | undefined;
  if (item.type === "ASSET" && meta?.fileKey) {
    assetMeta = {
      fileKey: meta.fileKey as string,
      fileName: (meta.fileName as string) ?? "",
      fileSize: (meta.fileSize as number) ?? 0,
      mimeType: (meta.mimeType as string) ?? "application/octet-stream",
    };
  }

  return {
    id: item.id,
    title: item.title,
    type: item.type as ItemType,
    content: item.content,
    language: typeof meta?.language === "string" ? meta.language : undefined,
    assetMeta,
    isVerified: item.isVerified,
    authorName: item.author.name ?? "Unknown",
    lastEditedByName: item.lastEditedBy?.name ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    spaces: item.spaces.map((s) => s.space),
  };
}

export type UpdateItemFields = {
  title: string;
  content?: string;
  metadata?: Record<string, unknown>;
  lastEditedById: string;
  spaceIds?: string[];
};

async function getItemRawMetadata(
  id: string,
  teamId: string,
): Promise<Record<string, unknown>> {
  const item = await prisma.item.findFirst({
    where: { id, teamId, deletedAt: null },
    select: { metadata: true },
  });
  return (item?.metadata as Record<string, unknown>) ?? {};
}

export async function getItemForUpdate(
  id: string,
  teamId: string,
): Promise<{ type: string; metadata: Record<string, unknown> } | null> {
  const item = await prisma.item.findFirst({
    where: { id, teamId, deletedAt: null },
    select: { type: true, metadata: true },
  });
  if (!item) return null;
  return { type: item.type, metadata: (item.metadata as Record<string, unknown>) ?? {} };
}

export { getItemRawMetadata };

export async function updateItem(
  id: string,
  teamId: string,
  fields: UpdateItemFields,
): Promise<ItemDetail | null> {
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.item.updateMany({
      where: { id, teamId, deletedAt: null },
      data: {
        title: fields.title,
        lastEditedById: fields.lastEditedById,
        ...(fields.content !== undefined && { content: fields.content }),
        ...(fields.metadata !== undefined && {
          metadata: fields.metadata as InputJsonValue,
        }),
      },
    });

    if (result.count === 0) return null;

    if (fields.spaceIds !== undefined) {
      await tx.itemSpace.deleteMany({ where: { itemId: id } });
      if (fields.spaceIds.length > 0) {
        const validSpaces = await tx.space.findMany({
          where: { id: { in: fields.spaceIds }, teamId },
          select: { id: true },
        });
        const validIds = validSpaces.map((s) => s.id);
        if (validIds.length > 0) {
          await tx.itemSpace.createMany({
            data: validIds.map((spaceId) => ({ itemId: id, spaceId })),
            skipDuplicates: true,
          });
        }
      }
    }

    return true;
  });

  if (!updated) return null;
  return getItemById(id, teamId);
}

export async function softDeleteItem(
  id: string,
  teamId: string,
): Promise<{ deleted: boolean; fileUrl: string | null }> {
  // Fetch fileUrl before deleting so caller can clean R2
  const item = await prisma.item.findFirst({
    where: { id, teamId, deletedAt: null },
    select: { fileUrl: true },
  });

  if (!item) return { deleted: false, fileUrl: null };

  const result = await prisma.item.updateMany({
    where: { id, teamId, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  if (result.count === 0) return { deleted: false, fileUrl: null };

  return { deleted: true, fileUrl: item.fileUrl ?? null };
}

export async function getItemCounts(
  teamId: string,
): Promise<{ total: number; verified: number; recentActivity: number }> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [total, verified, recentActivity] = await Promise.all([
    prisma.item.count({ where: { teamId, deletedAt: null } }),
    prisma.item.count({ where: { teamId, deletedAt: null, isVerified: true } }),
    prisma.item.count({
      where: { teamId, deletedAt: null, updatedAt: { gte: since } },
    }),
  ]);

  return { total, verified, recentActivity };
}
