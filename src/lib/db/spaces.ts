import { prisma } from "@/lib/prisma";

export type SpaceOption = {
  id: string;
  name: string;
  color: string;
};

export async function getAllSpaces(teamId: string): Promise<SpaceOption[]> {
  return prisma.space.findMany({
    where: { teamId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, color: true },
  });
}

export type SpaceRow = {
  id: string;
  name: string;
  color: string;
  description: string | null;
  isPersonal: boolean;
  itemCount: number;
  updatedAt: string; // ISO string — safe to pass to client components
};

export async function getRecentSpaces(
  teamId: string,
  limit: number = 6,
): Promise<SpaceRow[]> {
  const spaces = await prisma.space.findMany({
    where: { teamId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      color: true,
      description: true,
      isPersonal: true,
      updatedAt: true,
      _count: { select: { items: true } },
    },
  });

  return spaces.map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
    description: s.description,
    isPersonal: s.isPersonal,
    itemCount: s._count.items,
    updatedAt: s.updatedAt.toISOString(),
  }));
}
