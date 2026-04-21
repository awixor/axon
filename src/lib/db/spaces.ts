import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type InsertSpaceData = {
  name: string;
  description?: string | null;
  color: string;
  visibility: "PUBLIC" | "PRIVATE_TO_TEAM";
};

export async function insertSpace(teamId: string, data: InsertSpaceData) {
  return prisma.space.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      color: data.color,
      visibility: data.visibility,
      isPersonal: false,
      teamId,
    },
    select: { id: true, name: true, color: true },
  });
}

export type SpaceOption = {
  id: string;
  name: string;
  color: string;
};

export const getAllSpaces = cache(async function getAllSpaces(
  teamId: string,
): Promise<SpaceOption[]> {
  return prisma.space.findMany({
    where: { teamId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, color: true },
  });
});

export type SpaceRow = {
  id: string;
  name: string;
  color: string;
  description: string | null;
  isPersonal: boolean;
  itemCount: number;
  updatedAt: string; // ISO string — safe to pass to client components
};

export type SpaceDetail = SpaceRow & { visibility: "PUBLIC" | "PRIVATE_TO_TEAM" };

export const getAllSpacesWithCount = cache(async function getAllSpacesWithCount(
  teamId: string,
): Promise<SpaceRow[]> {
  const spaces = await prisma.space.findMany({
    where: { teamId },
    orderBy: { name: "asc" },
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
});

export const getSpaceById = cache(async function getSpaceById(
  id: string,
  teamId: string,
): Promise<SpaceDetail | null> {
  const s = await prisma.space.findFirst({
    where: { id, teamId },
    select: {
      id: true,
      name: true,
      color: true,
      description: true,
      isPersonal: true,
      visibility: true,
      updatedAt: true,
      _count: { select: { items: true } },
    },
  });

  if (!s) return null;

  return {
    id: s.id,
    name: s.name,
    color: s.color,
    description: s.description,
    isPersonal: s.isPersonal,
    visibility: s.visibility,
    itemCount: s._count.items,
    updatedAt: s.updatedAt.toISOString(),
  };
});

export const getRecentSpaces = cache(async function getRecentSpaces(
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
});
