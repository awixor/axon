import { prisma } from "@/lib/prisma";
import type { InputJsonValue } from "@prisma/client/runtime/client";
import { type ItemType } from "@/types/items";

export type ItemDetail = {
  id: string;
  title: string;
  type: ItemType;
  content: string;
  language?: string;
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
  const items = await prisma.item.findMany({
    where: { teamId, type, deletedAt: null },
    orderBy: { updatedAt: "desc" },
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

  return {
    id: item.id,
    title: item.title,
    type: item.type as ItemType,
    content: item.content,
    language: typeof meta?.language === "string" ? meta.language : undefined,
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

export { getItemRawMetadata };

export async function updateItem(
  id: string,
  teamId: string,
  fields: UpdateItemFields,
): Promise<ItemDetail | null> {
  const result = await prisma.item.updateMany({
    where: { id, teamId, deletedAt: null },
    data: {
      title: fields.title,
      ...(fields.content !== undefined && { content: fields.content }),
      ...(fields.metadata !== undefined && {
        metadata: fields.metadata as InputJsonValue,
      }),
    },
  });

  if (result.count === 0) return null;
  return getItemById(id, teamId);
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
