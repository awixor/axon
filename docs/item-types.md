# Item Types

Axon has 7 system item types defined in the `ItemType` enum (`prisma/schema.prisma`). All types share the same `Item` model and are visually distinguished via `src/lib/type-config.ts`.

---

## Per-Type Reference

### SNIPPET
| Field   | Value |
|---------|-------|
| Label   | Snippet / Snippets |
| Icon    | `Code2` (Lucide) |
| Color   | `#60a5fa` (blue) |
| Purpose | Shared code patterns — reusable functions, React components, SQL queries, etc. |
| Content | Raw code (text). Language inferred from content. No `fileUrl` used. |

### RUNBOOK
| Field   | Value |
|---------|-------|
| Label   | Runbook / Runbooks |
| Icon    | `Terminal` (Lucide) |
| Color   | `#f87171` (red) |
| Purpose | Step-by-step terminal commands and operational procedures. |
| Content | Markdown with fenced bash/shell blocks. No `fileUrl` used. |

### SECRET_REF
| Field   | Value |
|---------|-------|
| Label   | Secret / Secrets |
| Icon    | `ShieldCheck` (Lucide) |
| Color   | `#fbbf24` (amber) |
| Purpose | Pointer to an external secret store (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault). Not the secret itself. |
| Content | Text describing vault path, store name, rotation schedule, access policy. No `fileUrl`. |

### DOC
| Field   | Value |
|---------|-------|
| Label   | Doc / Docs |
| Icon    | `FileText` (Lucide) |
| Color   | `#a78bfa` (purple) |
| Purpose | Long-form documentation — onboarding guides, engineering handbooks, ADRs. |
| Content | Markdown prose. Can be lengthy. No `fileUrl` used. |

### RESOURCE
| Field   | Value |
|---------|-------|
| Label   | Resource / Resources |
| Icon    | `Globe` (Lucide) |
| Color   | `#34d399` (green) |
| Purpose | Curated internal or external URLs with context notes. |
| Content | Text containing a URL and optional notes (e.g. `URL: https://… \n Notes: …`). No `fileUrl`. |

### ASSET
| Field   | Value |
|---------|-------|
| Label   | Asset / Assets |
| Icon    | `Paperclip` (Lucide) |
| Color   | `#94a3b8` (slate) |
| Purpose | Architecture diagrams, images, or binary files stored in Cloudflare R2. Team-Pro only. |
| Content | Description or caption text. `fileUrl` points to the R2 object URL. |

### BLUEPRINT
| Field   | Value |
|---------|-------|
| Label   | Blueprint / Blueprints |
| Icon    | `Layout` (Lucide) |
| Color   | `#6366f1` (indigo) |
| Purpose | Reusable AI prompts for project initialization or automation workflows. |
| Content | Plain-text prompt instructions intended to be sent to an AI model. No `fileUrl`. |

---

## Classification Summary

### By content storage mechanism

| Category | Types | Notes |
|----------|-------|-------|
| **Text / Markdown** | DOC, RUNBOOK, SNIPPET, BLUEPRINT, SECRET_REF | `content` field only; `fileUrl` is null |
| **URL pointer** | RESOURCE | `content` holds the URL + notes inline |
| **File attachment** | ASSET | `fileUrl` required; `content` is a caption/description |

### By access restriction

| Tier | Types |
|------|-------|
| All plans | SNIPPET, RUNBOOK, SECRET_REF, DOC, RESOURCE, BLUEPRINT |
| Team-Pro only | ASSET (file storage via Cloudflare R2) |

---

## Shared Item Properties

All items share these fields regardless of type:

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` (cuid) | Primary key |
| `title` | `String` | Display name |
| `type` | `ItemType` | Enum discriminator |
| `content` | `String @db.Text` | Primary text payload |
| `metadata` | `Json?` | Optional structured extras |
| `fileUrl` | `String?` | Non-null for ASSET only |
| `isVerified` | `Boolean` | Manually verified by a team lead |
| `visibility` | `Visibility` | `PUBLIC` or `PRIVATE_TO_TEAM` |
| `authorId` | `String` | FK → User (creator) |
| `lastEditedById` | `String?` | FK → User (last editor) |
| `teamId` | `String` | FK → Team |
| `deletedAt` | `DateTime?` | Soft-delete timestamp |
| `createdAt` / `updatedAt` | `DateTime` | Timestamps |

Items are linked to Spaces via the `ItemSpace` join table, which also carries a `pinned` flag per space assignment.

---

## Display Differences

| Aspect | Details |
|--------|---------|
| **Color badge** | Each type card/row renders a colored dot or badge using its hex color from `TYPE_CONFIG` |
| **Icon** | Lucide icon rendered next to the type label |
| **Content rendering** | DOC/RUNBOOK/SNIPPET render Markdown; RESOURCE should linkify the URL; SECRET_REF should mask or warn; ASSET should show a file preview/download |
| **Verification badge** | `isVerified` items show a checkmark regardless of type |
| **Pro gate** | ASSET creation is gated behind `team.isPro` check |

---

*Sources: `prisma/schema.prisma`, `src/lib/type-config.ts`, `prisma/seed.ts`, `context/project-overview.md`*
