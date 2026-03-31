import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ItemType, Role, Visibility } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ── Team ──────────────────────────────────────────────────────────────────
  const team = await prisma.team.upsert({
    where: { id: "team-demo" },
    update: {},
    create: {
      id: "team-demo",
      name: "Acme Engineering",
      isPro: false,
    },
  });

  // ── Users ─────────────────────────────────────────────────────────────────
  const jane = await prisma.user.upsert({
    where: { email: "jane@acme.dev" },
    update: {},
    create: {
      id: "user-1",
      email: "jane@acme.dev",
      name: "Jane Doe",
      role: Role.ADMIN,
      teamId: team.id,
    },
  });

  const sarah = await prisma.user.upsert({
    where: { email: "sarah@acme.dev" },
    update: {},
    create: {
      id: "user-2",
      email: "sarah@acme.dev",
      name: "Sarah Chen",
      role: Role.MEMBER,
      teamId: team.id,
    },
  });

  const marcus = await prisma.user.upsert({
    where: { email: "marcus@acme.dev" },
    update: {},
    create: {
      id: "user-3",
      email: "marcus@acme.dev",
      name: "Marcus Webb",
      role: Role.MEMBER,
      teamId: team.id,
    },
  });

  // ── Spaces ────────────────────────────────────────────────────────────────
  const spaceDefs = [
    { id: "space-1", name: "Onboarding 2026", color: "#60a5fa" },
    { id: "space-2", name: "Infrastructure/SRE", color: "#f87171" },
    { id: "space-3", name: "Frontend Standards", color: "#a78bfa" },
    { id: "space-4", name: "Security Protocols", color: "#fbbf24" },
    { id: "space-5", name: "API Guidelines", color: "#34d399" },
    { id: "space-6", name: "DevOps Playbooks", color: "#6366f1" },
  ];

  for (const s of spaceDefs) {
    await prisma.space.upsert({
      where: { id: s.id },
      update: {},
      create: { ...s, visibility: Visibility.PRIVATE_TO_TEAM, teamId: team.id },
    });
  }

  // ── Items ─────────────────────────────────────────────────────────────────
  const itemDefs: {
    id: string;
    title: string;
    type: ItemType;
    content: string;
    isVerified: boolean;
    authorId: string;
    spaceIds: string[];
  }[] = [
    {
      id: "item-1",
      title: "React Query Setup Pattern",
      type: ItemType.SNIPPET,
      content: `import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000, retry: 1 },
  },
});`,
      isVerified: true,
      authorId: sarah.id,
      spaceIds: ["space-1", "space-3"],
    },
    {
      id: "item-2",
      title: "PostgreSQL Backup Runbook",
      type: ItemType.RUNBOOK,
      content: `# Stop production server
ssh db-0.prod.acme.dev
pg_dump -U postgres neondb > backup-$(date +%Y%m%d).sql`,
      isVerified: true,
      authorId: marcus.id,
      spaceIds: ["space-2", "space-6"],
    },
    {
      id: "item-3",
      title: "AWS Production Access Keys",
      type: ItemType.SECRET_REF,
      content: `Vault Path: secret/aws/production/api-keys
Rotation Schedule: Every 90 days`,
      isVerified: false,
      authorId: jane.id,
      spaceIds: ["space-4"],
    },
    {
      id: "item-4",
      title: "Component Architecture Guide",
      type: ItemType.DOC,
      content: `# Component Architecture
## Atomic Design Principles
Our frontend follows atomic design: atoms → molecules → organisms → templates → pages.`,
      isVerified: false,
      authorId: sarah.id,
      spaceIds: ["space-3"],
    },
    {
      id: "item-5",
      title: "Internal API Documentation",
      type: ItemType.RESOURCE,
      content: `URL: https://docs.internal.acme.dev/api/v2
Auth: Bearer token via /auth/token`,
      isVerified: true,
      authorId: marcus.id,
      spaceIds: ["space-5"],
    },
    {
      id: "item-6",
      title: "System Architecture Diagram",
      type: ItemType.ASSET,
      content: `File: architecture-v1.fig
Last Updated: March 2026
Includes microservices overview and data flow diagrams.`,
      isVerified: true,
      authorId: jane.id,
      spaceIds: ["space-2"],
    },
    {
      id: "item-7",
      title: "Next.js Project Starter",
      type: ItemType.BLUEPRINT,
      content: `npx create-next-app@latest --typescript --tailwind --eslint --app --src-dir`,
      isVerified: true,
      authorId: sarah.id,
      spaceIds: ["space-1", "space-3"],
    },
    {
      id: "item-8",
      title: "Kubernetes Deployment Script",
      type: ItemType.RUNBOOK,
      content: `kubectl apply -f k8s/staging/
kubectl rollout status deployment/axon-api
kubectl get pods -n staging`,
      isVerified: true,
      authorId: marcus.id,
      spaceIds: ["space-2", "space-6"],
    },
    {
      id: "item-9",
      title: "Error Handling Patterns",
      type: ItemType.SNIPPET,
      content: `class ApplicationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ApplicationError';
  }
}`,
      isVerified: false,
      authorId: sarah.id,
      spaceIds: ["space-3"],
    },
    {
      id: "item-10",
      title: "Stripe Integration Keys",
      type: ItemType.SECRET_REF,
      content: `Vault Path: secret/stripe/production
Keys: pk_live_*, sk_live_*`,
      isVerified: false,
      authorId: jane.id,
      spaceIds: ["space-4"],
    },
    {
      id: "item-11",
      title: "Git Workflow Documentation",
      type: ItemType.DOC,
      content: `# Git Workflow
## Branch Naming
- feature/TICKET-id
- fix/TICKET-id
- chore/description`,
      isVerified: false,
      authorId: marcus.id,
      spaceIds: ["space-1", "space-6"],
    },
    {
      id: "item-12",
      title: "CI/CD Pipeline Blueprint",
      type: ItemType.BLUEPRINT,
      content: `# GitHub Actions Workflow
name: CI/CD Pipeline
on:
  push:
    branches: [main, staging]`,
      isVerified: false,
      authorId: jane.id,
      spaceIds: ["space-6"],
    },
  ];

  for (const { spaceIds, ...item } of itemDefs) {
    const created = await prisma.item.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        lastEditedById: item.authorId,
        teamId: team.id,
      },
    });

    for (const spaceId of spaceIds) {
      await prisma.itemSpace.upsert({
        where: { itemId_spaceId: { itemId: created.id, spaceId } },
        update: {},
        create: { itemId: created.id, spaceId },
      });
    }
  }

  // Pin item-1 and item-5 to their spaces
  await prisma.itemSpace.update({
    where: { itemId_spaceId: { itemId: "item-1", spaceId: "space-1" } },
    data: { pinned: true },
  });
  await prisma.itemSpace.update({
    where: { itemId_spaceId: { itemId: "item-5", spaceId: "space-5" } },
    data: { pinned: true },
  });

  console.log("✅ Seed complete");
  console.log(`   Team:   ${team.name}`);
  console.log(`   Users:  3`);
  console.log(`   Spaces: ${spaceDefs.length}`);
  console.log(`   Items:  ${itemDefs.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
