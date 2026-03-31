import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔌 Testing database connection...\n");

  // ── Connection ────────────────────────────────────────────────────────────
  await prisma.$connect();
  console.log("✅ Connected to Neon PostgreSQL\n");

  // ── Team ──────────────────────────────────────────────────────────────────
  const teams = await prisma.team.findMany();
  console.log(`📦 Teams (${teams.length}):`);
  teams.forEach((t) => console.log(`   - ${t.name} | pro: ${t.isPro}`));

  // ── Users ─────────────────────────────────────────────────────────────────
  const users = await prisma.user.findMany({ select: { name: true, email: true, role: true } });
  console.log(`\n👤 Users (${users.length}):`);
  users.forEach((u) => console.log(`   - ${u.name} <${u.email}> [${u.role}]`));

  // ── Spaces ────────────────────────────────────────────────────────────────
  const spaces = await prisma.space.findMany({ select: { name: true, color: true, _count: { select: { items: true } } } });
  console.log(`\n🗂  Spaces (${spaces.length}):`);
  spaces.forEach((s) => console.log(`   - ${s.name} | color: ${s.color} | items: ${s._count.items}`));

  // ── Items ─────────────────────────────────────────────────────────────────
  const items = await prisma.item.findMany({ select: { title: true, type: true, isVerified: true } });
  console.log(`\n📄 Items (${items.length}):`);
  items.forEach((i) => console.log(`   - [${i.type}] ${i.title} | verified: ${i.isVerified}`));

  // ── Pinned items ──────────────────────────────────────────────────────────
  const pinned = await prisma.itemSpace.findMany({
    where: { pinned: true },
    select: { item: { select: { title: true } }, space: { select: { name: true } } },
  });
  console.log(`\n📌 Pinned (${pinned.length}):`);
  pinned.forEach((p) => console.log(`   - "${p.item.title}" in ${p.space.name}`));

  console.log("\n✅ All checks passed");
}

main()
  .catch((e) => {
    console.error("❌ Test failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
