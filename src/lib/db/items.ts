import { prisma } from "@/lib/prisma";
import { type ItemType } from "@/types/items";

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

export async function getItemCounts(
  teamId: string,
): Promise<{ total: number }> {
  const total = await prisma.item.count({
    where: { teamId, deletedAt: null },
  });
  return { total };
}
