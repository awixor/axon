import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ItemType, Role, Visibility } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ── Cleanup (order respects FK constraints) ───────────────────────────────
  await prisma.auditLog.deleteMany();
  await prisma.itemSpace.deleteMany();
  await prisma.item.deleteMany();
  await prisma.space.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();

  // ── Team ──────────────────────────────────────────────────────────────────
  const team = await prisma.team.upsert({
    where: { id: "team-demo" },
    update: {},
    create: {
      id: "team-demo",
      name: "Axon Demo Team",
      isPro: true,
    },
  });

  // ── User ──────────────────────────────────────────────────────────────────
  const demo = await prisma.user.upsert({
    where: { email: "demo@axon.so" },
    update: {},
    create: {
      id: "user-demo",
      email: "demo@axon.so",
      name: "Demo Engineer",
      role: Role.ADMIN,
      emailVerified: new Date(),
      teamId: team.id,
    },
  });

  // ── Team Spaces ───────────────────────────────────────────────────────────
  const teamSpaceDefs = [
    {
      id: "space-onboarding",
      name: "Onboarding",
      color: "#60a5fa",
      description: "Getting-started guides, setup docs, first steps",
    },
    {
      id: "space-ai-workflows",
      name: "AI Workflows",
      color: "#f87171",
      description: "AI prompts, blueprints, and automation templates",
    },
    {
      id: "space-general",
      name: "General",
      color: "#34d399",
      description: "Shared resources that don't belong elsewhere",
    },
  ];

  for (const s of teamSpaceDefs) {
    await prisma.space.upsert({
      where: { id: s.id },
      update: {},
      create: {
        ...s,
        visibility: Visibility.PRIVATE_TO_TEAM,
        isPersonal: false,
        teamId: team.id,
      },
    });
  }

  // ── Personal Space (demo user) ────────────────────────────────────────────
  await prisma.space.upsert({
    where: { id: "space-personal-demo" },
    update: {},
    create: {
      id: "space-personal-demo",
      name: "My Space",
      color: "#fbbf24",
      description: "Personal scratchpad",
      visibility: Visibility.PRIVATE_TO_TEAM,
      isPersonal: true,
      userId: demo.id,
      teamId: team.id,
    },
  });

  // ── Items ─────────────────────────────────────────────────────────────────
  const itemDefs: {
    id: string;
    title: string;
    type: ItemType;
    content: string;
    isVerified: boolean;
    spaceIds: string[];
  }[] = [
    // Onboarding
    {
      id: "item-onboarding-doc",
      title: "Team Onboarding Guide",
      type: ItemType.DOC,
      content: `# Welcome to Axon Demo Team

## Day 1 Checklist
- [ ] Get access to this workspace
- [ ] Read the engineering handbook
- [ ] Set up your local dev environment (see the Runbook)
- [ ] Say hi in #engineering

## Useful Links
- GitHub org: github.com/axon-demo
- Internal API docs: docs.internal.axon.so
- Incident runbook: Spaces → Infrastructure`,
      isVerified: true,
      spaceIds: ["space-onboarding"],
    },
    {
      id: "item-onboarding-runbook",
      title: "Local Dev Environment Setup",
      type: ItemType.RUNBOOK,
      content: `# Local Dev Setup

## Prerequisites
- Node.js 20+
- pnpm 9+
- Docker (for local Postgres)

## Steps
\`\`\`bash
# 1. Clone the repo
git clone git@github.com:axon-demo/axon.git && cd axon

# 2. Install dependencies
pnpm install

# 3. Copy env vars
cp .env.example .env.local

# 4. Start local database
docker compose up -d

# 5. Run migrations and seed
pnpm db:migrate && pnpm db:seed

# 6. Start dev server
pnpm dev
\`\`\``,
      isVerified: true,
      spaceIds: ["space-onboarding"],
    },
    {
      id: "item-onboarding-blueprint",
      title: "Next.js Project Starter Prompt",
      type: ItemType.BLUEPRINT,
      content: `Create a new Next.js 16 project with the following setup:
- TypeScript strict mode
- Tailwind CSS v4
- App Router with src/ directory
- ShadCN UI initialized
- Prisma 7 with Neon PostgreSQL adapter
- Auth.js (NextAuth v5) with credentials + GitHub provider
- ESLint + Prettier configured

Start by scaffolding the folder structure, then implement auth, then database. Ask before adding any third-party dependencies not listed above.`,
      isVerified: true,
      spaceIds: ["space-onboarding"],
    },

    // AI Workflows
    {
      id: "item-ai-claude-blueprint",
      title: "Claude API Integration Prompt",
      type: ItemType.BLUEPRINT,
      content: `Integrate the Anthropic Claude API into this Next.js app.

Requirements:
- Use the @anthropic-ai/sdk package
- Create a Server Action at src/actions/ai.ts
- Model: claude-sonnet-4-6
- Stream responses using the streaming API
- Add a simple chat UI component at src/components/ai/ChatPanel.tsx
- Store conversation history in component state only (no DB persistence needed)
- Handle errors gracefully and show toast notifications

Do not add rate limiting or auth checks in this first pass.`,
      isVerified: true,
      spaceIds: ["space-ai-workflows"],
    },
    {
      id: "item-ai-review-blueprint",
      title: "Code Review Automation Prompt",
      type: ItemType.BLUEPRINT,
      content: `Set up an automated code review workflow using Claude.

Trigger: GitHub Actions on pull_request opened/synchronize
Steps:
1. Fetch the PR diff via GitHub API
2. Send diff to Claude claude-sonnet-4-6 with this system prompt:
   "You are a senior engineer reviewing a PR. Focus on: correctness, security (OWASP top 10), performance, and code style. Be concise. Flag blockers vs suggestions."
3. Post the review as a PR comment via GitHub API
4. Exit with code 1 if Claude flags any blocker-level issues

Provide the full GitHub Actions YAML and the Node.js script.`,
      isVerified: true,
      spaceIds: ["space-ai-workflows"],
    },
    {
      id: "item-ai-claude-docs",
      title: "Claude API Documentation",
      type: ItemType.RESOURCE,
      content: `URL: https://docs.anthropic.com/en/api/getting-started
Notes: Official Anthropic API reference. See the "Messages" and "Streaming" sections for integration patterns used in our Claude API Integration Blueprint.`,
      isVerified: true,
      spaceIds: ["space-ai-workflows"],
    },

    // General
    {
      id: "item-general-api-resource",
      title: "Internal API Documentation",
      type: ItemType.RESOURCE,
      content: `URL: https://docs.internal.axon.so/api/v1
Auth: Bearer token — obtain via POST /auth/token with your demo@axon.so credentials.
Rate limit: 1000 req/min on Team-Pro plan.`,
      isVerified: true,
      spaceIds: ["space-general"],
    },
    {
      id: "item-general-error-snippet",
      title: "Reusable Error Handling Pattern",
      type: ItemType.SNIPPET,
      content: `// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 500,
  ) {
    super(message);
    this.name = "AppError";
  }
}

// Server Action pattern
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function err(message: string): ActionResult<never> {
  return { success: false, error: message };
}`,
      isVerified: true,
      spaceIds: ["space-general"],
    },
    {
      id: "item-general-tailwind-resource",
      title: "Tailwind CSS v4 Docs",
      type: ItemType.RESOURCE,
      content: `URL: https://tailwindcss.com/docs
Version: v4 — note breaking changes from v3. We use CSS-based config (@theme directive in globals.css). No tailwind.config.js in this project.`,
      isVerified: true,
      spaceIds: ["space-general"],
    },

    // Personal (demo user)
    {
      id: "item-personal-secret",
      title: "AWS Production Keys Reference",
      type: ItemType.SECRET_REF,
      content: `Vault Path: secret/aws/production/api-keys
Store: AWS Secrets Manager (us-east-1)
Rotation Schedule: Every 90 days — next rotation: 2026-06-01
Access: ADMIN role only`,
      isVerified: false,
      spaceIds: ["space-personal-demo"],
    },
    {
      id: "item-personal-notes",
      title: "Personal Notes Draft",
      type: ItemType.DOC,
      content: `# Draft — not ready to share

## Ideas
- Investigate pgvector semantic search for item discovery
- Explore Claude Knowledge Bridge feature for auto-linking snippets

## TODO
- [ ] Finish onboarding guide review
- [ ] Ping DevOps about R2 storage allocation`,
      isVerified: false,
      spaceIds: ["space-personal-demo"],
    },
  ];

  for (const { spaceIds, ...item } of itemDefs) {
    const created = await prisma.item.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        authorId: demo.id,
        lastEditedById: demo.id,
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

  console.log("✅ Seed complete");
  console.log(`   Team:   ${team.name} (isPro: ${team.isPro})`);
  console.log(`   Users:  1 (${demo.email})`);
  console.log(`   Spaces: ${teamSpaceDefs.length} team + 1 personal`);
  console.log(`   Items:  ${itemDefs.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
