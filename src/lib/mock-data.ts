export type ItemType =
  | "SNIPPET"
  | "RUNBOOK"
  | "SECRET_REF"
  | "DOC"
  | "RESOURCE"
  | "ASSET"
  | "BLUEPRINT";

export type Role = "ADMIN" | "MEMBER" | "READ_ONLY";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarInitials: string;
}

export interface Space {
  id: string;
  name: string;
  color: string;
  itemCount: number;
  isFavorite?: boolean;
}

export interface Item {
  id: string;
  title: string;
  type: ItemType;
  content: string;
  isVerified: boolean;
  authorName: string;
  spaceIds: string[];
  updatedAt: string;
}

export const currentUser: User = {
  id: "user-1",
  name: "Demo",
  email: "demo@getaxon.io",
  role: "ADMIN",
  avatarInitials: "JD",
};

export const spaces: Space[] = [
  { id: "space-1", name: "Onboarding 2026", color: "#60a5fa", itemCount: 12, isFavorite: true },
  {
    id: "space-2",
    name: "Infrastructure/SRE",
    color: "#f87171",
    itemCount: 18,
  },
  {
    id: "space-3",
    name: "Frontend Standards",
    color: "#a78bfa",
    itemCount: 15,
    isFavorite: true,
  },
  { id: "space-4", name: "Security Protocols", color: "#fbbf24", itemCount: 9 },
  { id: "space-5", name: "API Guidelines", color: "#34d399", itemCount: 6 },
  { id: "space-6", name: "DevOps Playbooks", color: "#6366f1", itemCount: 23 },
];

export const items: Item[] = [
  {
    id: "item-1",
    title: "React Query Setup Pattern",
    type: "SNIPPET",
    content: `import { QueryClient, QueryClientProvider } from...\n\nconst queryClient = new QueryClient({\n  defaultOptions: {\n    queries: {\n      staleTime: 60 * 1000,\n      retry: 1,\n    },\n  },\n})`,
    isVerified: true,
    authorName: "Sarah Chen",
    spaceIds: ["space-1", "space-3"],
    updatedAt: "2 hours ago",
  },
  {
    id: "item-2",
    title: "PostgreSQL Backup Runbook",
    type: "RUNBOOK",
    content: `# This Procedure Will Stop Into\nproduction server run awakingdrum db-0...\n\n# Step 100 into production server run awaking`,
    isVerified: true,
    authorName: "Marcus Webb",
    spaceIds: ["space-2", "space-6"],
    updatedAt: "1 day ago",
  },
  {
    id: "item-3",
    title: "AWS Production Access Keys",
    type: "SECRET_REF",
    content: `Vault Path: secret/aws/production/api-keys\nRotation Schedule: Every 90 days`,
    isVerified: false,
    authorName: "Jane Doe",
    spaceIds: ["space-4"],
    updatedAt: "3 days ago",
  },
  {
    id: "item-4",
    title: "Component Architecture Guide",
    type: "DOC",
    content: `# Component Architecture ## Atomic\nDesign Principles Our frontend follow...`,
    isVerified: false,
    authorName: "Sarah Chen",
    spaceIds: ["space-3"],
    updatedAt: "5 hours ago",
  },
  {
    id: "item-5",
    title: "Internal API Documentation",
    type: "RESOURCE",
    content: `URL:\nhttps://docs.internal.acme.dev/api/v2...`,
    isVerified: true,
    authorName: "Marcus Webb",
    spaceIds: ["space-5"],
    updatedAt: "12 hours ago",
  },
  {
    id: "item-6",
    title: "System Architecture Diagram",
    type: "ASSET",
    content: `File: architecture-v1.fig\nLast Updated: March 2026\nIncludes microservices overview...`,
    isVerified: true,
    authorName: "Jane Doe",
    spaceIds: ["space-2"],
    updatedAt: "1 week ago",
  },
  {
    id: "item-7",
    title: "Next.js Project Starter",
    type: "BLUEPRINT",
    content: `npx create-next-app@latest --\ntypescript --tailwind --eslint --app ...`,
    isVerified: true,
    authorName: "Sarah Chen",
    spaceIds: ["space-1", "space-3"],
    updatedAt: "4 days ago",
  },
  {
    id: "item-8",
    title: "Kubernetes Deployment Script",
    type: "RUNBOOK",
    content: `kubectl apply -f k8s/staging/ # Verify pods submit go...`,
    isVerified: true,
    authorName: "Marcus Webb",
    spaceIds: ["space-2", "space-6"],
    updatedAt: "8 hours ago",
  },
  {
    id: "item-9",
    title: "Error Handling Patterns",
    type: "SNIPPET",
    content: `class ApplicationError {\n  constructor(message: string, public...`,
    isVerified: false,
    authorName: "Sarah Chen",
    spaceIds: ["space-3"],
    updatedAt: "2 days ago",
  },
  {
    id: "item-10",
    title: "Stripe Integration Keys",
    type: "SECRET_REF",
    content: `Vault Path: secret/stripe/production\nKeys: pk_live_*, sk_live_* @stripe...`,
    isVerified: false,
    authorName: "Jane Doe",
    spaceIds: ["space-4"],
    updatedAt: "5 hours ago",
  },
  {
    id: "item-11",
    title: "Git Workflow Documentation",
    type: "DOC",
    content: `# Git Workflow ## Branch Naming -\nfeature/TICKET-id -fix: branches; loin...`,
    isVerified: false,
    authorName: "Marcus Webb",
    spaceIds: ["space-1", "space-6"],
    updatedAt: "3 hours ago",
  },
  {
    id: "item-12",
    title: "CI/CD Pipeline Blueprint",
    type: "BLUEPRINT",
    content: `# GitHub Actions Workflow name: CI/CS\nPipeline on: push: branches: [main, ...`,
    isVerified: false,
    authorName: "Jane Doe",
    spaceIds: ["space-6"],
    updatedAt: "1 day ago",
  },
];
