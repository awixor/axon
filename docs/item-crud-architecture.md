# Item CRUD Architecture

Unified design for creating, reading, updating, and soft-deleting all 7 item types. Built on the existing codebase patterns: Server Components fetch via `lib/db/`, mutations go through Server Actions, client components handle interactivity only.

---

## File Structure

```
src/
├── actions/
│   └── items.ts                  # All item mutations (create, update, delete)
│
├── lib/db/
│   └── items.ts                  # All item queries (extend existing file)
│
├── app/
│   └── dashboard/
│       └── items/
│           └── [id]/
│               └── page.tsx      # Item detail page (server component)
│
└── components/
    └── items/
        ├── ItemForm.tsx          # Create/edit form — type-aware, client component
        ├── ItemFormFields.tsx    # Type-specific field rendering — client component
        ├── ItemViewer.tsx        # Read-only display — type-aware, client component
        └── DeleteItemButton.tsx  # Inline soft-delete confirmation — client component
```

---

## Routing

### Item Detail: `/dashboard/items/[id]`

One dynamic route handles all 7 types. The `page.tsx` fetches the item by `id`, then passes it to `ItemViewer` and `ItemForm`. No per-type routes.

```
/dashboard/items/cm123abc        → fetches item, renders based on item.type
/dashboard/items/new?type=SNIPPET → create mode, type pre-selected from query param
/dashboard/items/new?type=RUNBOOK → same route, different type
```

The `type` query param on new-item routes pre-seeds the form; the type selector is disabled once an item is saved (type is immutable after creation).

### ItemCard links

Each `ItemCard` on the dashboard wraps in an `<a href={/dashboard/items/${item.id}}>` (or `<Link>`). Currently the card is `cursor-pointer` without an href — this route is where that links.

---

## Data Fetching (`src/lib/db/items.ts`)

Extend the existing file with two new query functions. Existing functions (`getRecentItems`, `getPinnedItems`, `getItemCounts`) are unchanged.

### `getItem(id: string): Promise<ItemDetail | null>`

Returns full item data for the detail/edit view.

```typescript
export type ItemDetail = {
  id: string;
  title: string;
  type: ItemType;
  content: string;
  metadata: Record<string, unknown> | null;
  fileUrl: string | null;
  isVerified: boolean;
  visibility: "PUBLIC" | "PRIVATE_TO_TEAM";
  authorId: string;
  authorName: string;
  lastEditedById: string | null;
  lastEditedByName: string | null;
  teamId: string;
  createdAt: string;
  updatedAt: string;
  spaces: { id: string; name: string; color: string; pinned: boolean }[];
};
```

Query uses `prisma.item.findFirst({ where: { id, deletedAt: null }, select: { ...full fields... } })`.

### `getItemsByType(teamId: string, type: ItemType): Promise<ItemRow[]>`

For type-filtered list views (future). Returns the same `ItemRow` shape used by the dashboard grid.

---

## Mutations (`src/actions/items.ts`)

Single file for all item mutations. Follows the `{ success, data, error }` pattern already established in the codebase. All actions call `auth()` and check session before touching the DB.

### Return type

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### `createItem(input: CreateItemInput): Promise<ActionResult<{ id: string }>>`

**Input schema (Zod):**
```
title:      string, min 1, max 200
type:       ItemType enum
content:    string, min 1
visibility: "PUBLIC" | "PRIVATE_TO_TEAM"  (default PRIVATE_TO_TEAM)
spaceIds:   string[], optional
fileUrl:    string?, only for ASSET
```

**Steps:**
1. Validate session → `authorId = session.user.id`
2. Resolve `teamId` from user record
3. Pro gate: if `type === "ASSET"` and `!team.isPro` → return error
4. `prisma.item.create(...)` with `authorId`, `lastEditedById`, `teamId`
5. If `spaceIds` provided, batch-create `ItemSpace` records
6. Return `{ success: true, data: { id } }` → caller redirects to `/dashboard/items/[id]`

### `updateItem(id: string, input: UpdateItemInput): Promise<ActionResult<void>>`

**Input schema:** same shape as `CreateItemInput` minus `type` (immutable) and `spaceIds` (managed separately).

**Steps:**
1. Validate session
2. Fetch item, verify `item.teamId === user.teamId` (authorization)
3. `prisma.item.update({ where: { id }, data: { ...input, lastEditedById } })`

### `deleteItem(id: string): Promise<ActionResult<void>>`

Soft delete only — sets `deletedAt = new Date()`.

**Steps:**
1. Validate session
2. Fetch item, verify team membership
3. Role check: only `ADMIN` or item `authorId === session.user.id` can delete
4. `prisma.item.update({ where: { id }, data: { deletedAt: new Date() } })`

### `toggleVerified(id: string): Promise<ActionResult<void>>`

Flips `isVerified`. Restricted to `ADMIN` role.

### `updateItemSpaces(id: string, spaceIds: string[]): Promise<ActionResult<void>>`

Replaces the item's space assignments. Deletes existing `ItemSpace` rows for this item, inserts new ones. Used by a spaces-picker UI on the detail page.

---

## Components

### `ItemForm` (`src/components/items/ItemForm.tsx`) — client component

Unified create/edit form. Receives:
- `item?: ItemDetail` — undefined = create mode
- `defaultType?: ItemType` — pre-select in create mode
- `spaces: SpaceRow[]` — available spaces for the picker

Renders:
- Title input (all types)
- Type selector (create mode only; hidden in edit mode)
- `ItemFormFields` (type-specific fields)
- Visibility toggle
- Space picker (multi-select)
- Submit button → calls `createItem` or `updateItem` server action

### `ItemFormFields` (`src/components/items/ItemFormFields.tsx`) — client component

Switches on `type` to render the right content input:

| Type | Input |
|------|-------|
| SNIPPET | `<textarea>` with monospace font; language selector in `metadata` |
| RUNBOOK | `<textarea>` with monospace font |
| DOC | Markdown textarea (rich editor later) |
| BLUEPRINT | `<textarea>` plain text |
| SECRET_REF | Structured fields: vault path, store name, rotation date → serialized to `content` |
| RESOURCE | URL input + notes textarea → serialized to `content` as `URL: …\nNotes: …` |
| ASSET | File upload input → uploads to R2, stores URL in `fileUrl`; caption in `content` |

Type-specific logic is entirely here — `createItem` and `updateItem` are type-agnostic.

### `ItemViewer` (`src/components/items/ItemViewer.tsx`) — client component

Read-only display of an item. Switches on `type` for rendering:

| Type | Render |
|------|--------|
| SNIPPET | Syntax-highlighted code block |
| RUNBOOK | Markdown with styled command blocks |
| DOC | Rendered Markdown prose |
| BLUEPRINT | Plain preformatted text |
| SECRET_REF | Parsed fields displayed as key-value list; no raw content shown |
| RESOURCE | Parsed URL rendered as `<a>` link + notes text |
| ASSET | Image preview or file download link from `fileUrl` |

Displays: type badge, title, verification badge, author, timestamps, space chips, edit button (if authorized).

### `DeleteItemButton` (`src/components/items/DeleteItemButton.tsx`) — client component

Inline button that opens a confirmation prompt before calling `deleteItem`. On success, `router.push("/dashboard")`. Used on the detail page (authorized users only).

---

## Authorization Summary

| Action | Who can do it |
|--------|---------------|
| Create | Any authenticated team member |
| Read | Any authenticated team member (respects `visibility` once PUBLIC items exist) |
| Update | Author or ADMIN |
| Delete (soft) | Author or ADMIN |
| Toggle verified | ADMIN only |
| Create ASSET | Team-Pro members only |

Authorization checks happen inside Server Actions (not in components) so they cannot be bypassed client-side.

---

## Where Type-Specific Logic Lives

| Layer | Responsibility |
|-------|---------------|
| `ItemFormFields` | Renders different inputs per type; serializes structured data into `content` |
| `ItemViewer` | Renders different display per type; parses `content` back into structured view |
| `createItem` / `updateItem` | Type-agnostic — stores whatever `content` string the form provides |
| `TYPE_CONFIG` | Icon, color, label — shared across all display contexts |
| Prisma schema | No per-type columns; single `Item` model with `type` discriminator |

The actions and DB layer have zero type-specific branches. All content parsing and rendering is isolated to the two component files above.

---

## Data Flow Diagram

```
User fills ItemForm (client)
    └─ calls createItem / updateItem (server action)
          ├─ validates Zod schema
          ├─ checks auth + team membership
          ├─ (Pro gate for ASSET)
          └─ prisma.item.create / .update
                └─ returns { success, data }

Dashboard page (server component)
    └─ getRecentItems() / getPinnedItems()  →  ItemCard grid

/dashboard/items/[id] (server component)
    └─ getItem(id)
          ├─ ItemViewer (read-only display)
          └─ ItemForm (edit mode, pre-populated)
```

---

*Sources: `prisma/schema.prisma`, `docs/item-types.md`, `src/lib/db/items.ts`, `src/lib/db/spaces.ts`, `src/actions/auth.ts`, `src/app/dashboard/page.tsx`, `src/components/dashboard/ItemCard.tsx`*
