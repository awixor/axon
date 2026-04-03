import { prisma } from "@/lib/prisma";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  initials: string;
  teamId: string | null;
};

export type ProfileData = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  initials: string;
  createdAt: string;
  hasPassword: boolean;
  itemCountsByType: Record<string, number>;
  totalItems: number;
  totalSpaces: number;
};

export async function getUser(userId: string): Promise<UserRow | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, image: true, teamId: true },
  });

  if (!user) return null;

  const name = user.name ?? user.email ?? "?";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return {
    id: user.id,
    name,
    email: user.email ?? "",
    image: user.image ?? null,
    initials,
    teamId: user.teamId,
  };
}

export async function getProfileData(
  userId: string,
): Promise<ProfileData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      password: true,
      teamId: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  const name = user.name ?? user.email ?? "?";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const itemCountsByType: Record<string, number> = {};
  let totalItems = 0;
  let totalSpaces = 0;

  if (user.teamId) {
    const [itemGroups, spaceCount] = await Promise.all([
      prisma.item.groupBy({
        by: ["type"],
        where: { teamId: user.teamId, deletedAt: null },
        _count: { id: true },
      }),
      prisma.space.count({ where: { teamId: user.teamId } }),
    ]);

    for (const g of itemGroups) {
      itemCountsByType[g.type] = g._count.id;
      totalItems += g._count.id;
    }
    totalSpaces = spaceCount;
  }

  return {
    id: user.id,
    name,
    email: user.email ?? "",
    image: user.image ?? null,
    initials,
    createdAt: user.createdAt.toISOString(),
    hasPassword: user.password !== null,
    itemCountsByType,
    totalItems,
    totalSpaces,
  };
}
