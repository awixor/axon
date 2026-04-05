import {
  Code2,
  FileText,
  Globe,
  Layout,
  Paperclip,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { type ItemType } from "@/types/items";

export type TypeConfig = {
  label: string;
  plural: string;
  icon: React.ElementType;
  color: string;
};

export const TYPE_CONFIG: Record<ItemType, TypeConfig> = {
  SNIPPET: {
    label: "Snippet",
    plural: "Snippets",
    icon: Code2,
    color: "#60a5fa",
  },
  RUNBOOK: {
    label: "Runbook",
    plural: "Runbooks",
    icon: Terminal,
    color: "#f87171",
  },
  SECRET_REF: {
    label: "Secret",
    plural: "Secrets",
    icon: ShieldCheck,
    color: "#fbbf24",
  },
  DOC: {
    label: "Doc",
    plural: "Docs",
    icon: FileText,
    color: "#a78bfa",
  },
  RESOURCE: {
    label: "Resource",
    plural: "Resources",
    icon: Globe,
    color: "#34d399",
  },
  ASSET: {
    label: "Asset",
    plural: "Assets",
    icon: Paperclip,
    color: "#94a3b8",
  },
  BLUEPRINT: {
    label: "Blueprint",
    plural: "Blueprints",
    icon: Layout,
    color: "#6366f1",
  },
};

export const ITEM_TYPES = Object.keys(TYPE_CONFIG) as ItemType[];

export const ITEM_TYPE_BY_SLUG: Record<string, ItemType> = {
  snippets: "SNIPPET",
  runbooks: "RUNBOOK",
  secrets: "SECRET_REF",
  docs: "DOC",
  resources: "RESOURCE",
  assets: "ASSET",
  blueprints: "BLUEPRINT",
};
