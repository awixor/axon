"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { insertSpace } from "@/lib/db/spaces";
import { SpaceVisibility } from "@/lib/space-config";

const createSpaceSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().max(500).optional().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color"),
  visibility: z
    .enum([SpaceVisibility.PrivateToTeam, SpaceVisibility.Public])
    .default(SpaceVisibility.PrivateToTeam),
});

export type CreateSpaceInput = z.input<typeof createSpaceSchema>;

export async function createSpace(data: CreateSpaceInput) {
  const session = await auth();
  const teamId = session?.user?.teamId;

  if (!teamId) {
    return { success: false as const, error: "Not authenticated" };
  }

  const parsed = createSpaceSchema.safeParse(data);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { success: false as const, error: first ?? "Validation failed" };
  }

  const space = await insertSpace(teamId, {
    name: parsed.data.name,
    description: parsed.data.description,
    color: parsed.data.color,
    visibility: parsed.data.visibility,
  });

  revalidatePath("/dashboard");
  return { success: true as const, data: space };
}
