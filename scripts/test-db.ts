import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔌 Testing database connection...\n");

  await prisma.$connect();
  console.log("✅ Connected to Neon PostgreSQL\n");

  // ── Team ──────────────────────────────────────────────────────────────────
  const teams = await prisma.team.findMany();
  console.log(`📦 Teams (${teams.length}):`);
  teams.forEach((t) =>
    console.log(`   - ${t.name} | isPro: ${t.isPro} | id: ${t.id}`)
  );

  // ── Users ─────────────────────────────────────────────────────────────────
  const users = await prisma.user.findMany({
    select: { name: true, email: true, role: true, emailVerified: true },
  });
  console.log(`\n👤 Users (${users.length}):`);
  users.forEach((u) =>
    console.log(
      `   - ${u.name} <${u.email}> [${u.role}] | emailVerified: ${u.emailVerified ? "✅" : "❌"}`
    )
  );

  // ── Spaces ────────────────────────────────────────────────────────────────
  const spaces = await prisma.space.findMany({
    select: {
      name: true,
      color: true,
      isPersonal: true,
      owner: { select: { name: true } },
      _count: { select: { items: true } },
    },
    orderBy: { isPersonal: "asc" },
  });
  console.log(`\n🗂  Spaces (${spaces.length}):`);
  spaces.forEach((s) => {
    const kind = s.isPersonal ? `personal → ${s.owner?.name}` : "team";
    console.log(
      `   - ${s.name} | color: ${s.color} | ${kind} | items: ${s._count.items}`
    );
  });

  // ── Items ─────────────────────────────────────────────────────────────────
  const items = await prisma.item.findMany({
    select: {
      title: true,
      type: true,
      isVerified: true,
      spaces: { select: { space: { select: { name: true } } } },
    },
    orderBy: { type: "asc" },
  });
  console.log(`\n📄 Items (${items.length}):`);
  items.forEach((i) => {
    const spaceNames = i.spaces.map((s) => s.space.name).join(", ");
    console.log(
      `   - [${i.type}] ${i.title} | verified: ${i.isVerified} | spaces: ${spaceNames}`
    );
  });

  // ── Items per space ───────────────────────────────────────────────────────
  console.log("\n📊 Items per space:");
  spaces.forEach((s) => {
    const bar = "█".repeat(s._count.items);
    console.log(`   ${s.name.padEnd(15)} ${bar} ${s._count.items}`);
  });

  // ── Verification summary ──────────────────────────────────────────────────
  const verified = items.filter((i) => i.isVerified).length;
  const unverified = items.length - verified;
  console.log(`\n🔍 Verification: ${verified} verified, ${unverified} unverified`);

  // ── Assertions ────────────────────────────────────────────────────────────
  console.log("\n🧪 Assertions:");

  const team = teams[0];
  assert(teams.length === 1, "exactly 1 team");
  assert(team.name === "Axon Demo Team", `team name is "Axon Demo Team"`);
  assert(team.isPro === true, "team isPro is true");

  assert(users.length === 1, "exactly 1 user");
  assert(users[0].email === "demo@axon.so", "demo user email is demo@axon.so");
  assert(users[0].role === "ADMIN", "demo user role is ADMIN");
  assert(users[0].emailVerified !== null, "demo user emailVerified is set");

  const teamSpaces = spaces.filter((s) => !s.isPersonal);
  const personalSpaces = spaces.filter((s) => s.isPersonal);
  assert(teamSpaces.length === 3, "3 team spaces");
  assert(personalSpaces.length === 1, "1 personal space");
  assert(
    personalSpaces[0].owner?.name === "Demo Engineer",
    "personal space owned by Demo Engineer"
  );

  assert(items.length === 11, "11 items total (3+3+3 team + 2 personal)");
  assert(verified === 9, "9 verified items (team-space items)");
  assert(unverified === 2, "2 unverified items (personal space items)");

  console.log("\n✅ All checks passed");
}

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`   ✅ ${label}`);
  } else {
    console.error(`   ❌ FAIL: ${label}`);
    process.exitCode = 1;
  }
}

main()
  .catch((e) => {
    console.error("❌ Test failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
