import { prisma } from "@/lib/prisma";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  initials: string;
};

export async function getUser(userId: string): Promise<UserRow | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
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
    initials,
  };
}
