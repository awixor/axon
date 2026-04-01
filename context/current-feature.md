# Current Feature

## Status

<!-- Not Started|In Progress|Completed -->

Not Started

## Feature

<!-- feature here -->

## Goals

<!-- goals here -->

## Notes

<!-- notes here -->

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Added mock data (src/lib/mock-data.ts) for dashboard UI
- Dashboard UI Phase 1: ShadCN init, /dashboard route, dark mode, top bar with search and New Item button, sidebar/main placeholders
- Dashboard UI Phase 2: Collapsible sidebar, item types nav, favorite/recent spaces, user avatar area, mobile drawer
- Dashboard UI Phase 3: Stats cards, recent collections, pinned items, recent items grid with type filter tabs
- Prisma 7 + Neon PostgreSQL: schema, initial migration, seed (3 users, 6 spaces, 12 items), Prisma client singleton, db:\* scripts
- Schema hardening: Item gains metadata (JSONB), deletedAt (soft delete), visibility, optional lastEditedById
- Personal space schema: Space gains isPersonal + userId FK; seed-spec updated with 3 default spaces + personal space per user
- Seed demo dataset: rewrote seed.ts with Axon Demo Team, demo@axon.so admin user, 3 team spaces, 1 personal space, 11 items per seed-spec; cleanup block ensures re-runs are clean; test-db.ts updated with full assertions
- Dashboard Spaces: created src/lib/db/spaces.ts (getRecentSpaces), updated dashboard/page.tsx to server component, replaced mock Recent Collections with real SpaceCard grid + All/Team/Personal filter tabs; removed Collections StatCard; renamed to Spaces throughout
- Dashboard Items: created src/lib/db/items.ts (getRecentItems, getPinnedItems, getItemCounts), RecentItems component, time.ts helper, ItemRow type; replaced all mock item data with real Prisma queries; merged feature/dashboard-real-items into main
- Stats & Sidebar: extended getItemCounts (verified + recentActivity), replaced Spaces stat card with Verified Items + Recent Activity; replaced mock spaces and user in sidebar with real DB data (SpaceRow[] from layout, UserRow via getUser); added "View all spaces" link; created src/lib/db/users.ts
- Code Quality Quick Wins: removed 'use client' from DashboardMain, removed dotenv/config from prisma.ts, deleted dead mock-data.ts, fixed O(n×7) typeCounts scan to single-pass reduce in RecentItems, derived Sidebar ITEM_TYPES from TYPE_CONFIG, narrowed NavItem iconStyle to iconColor string
