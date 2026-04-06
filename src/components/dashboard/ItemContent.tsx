import {
  ItemContentProps,
  AssetContent,
  BlueprintContent,
  DocContent,
  PlainContent,
  ResourceContent,
  RunbookContent,
  SecretRefContent,
  SnippetContent,
} from "@/components/dashboard/ItemContentRenderers";

export function ItemContent({ item }: ItemContentProps) {
  switch (item.type) {
    case "SNIPPET":
      return <SnippetContent item={item} />;
    case "RUNBOOK":
      return <RunbookContent item={item} />;
    case "DOC":
      return <DocContent item={item} />;
    case "RESOURCE":
      return <ResourceContent item={item} />;
    case "SECRET_REF":
      return <SecretRefContent item={item} />;
    case "BLUEPRINT":
      return <BlueprintContent item={item} />;
    case "ASSET":
      return <AssetContent item={item} />;
    default:
      return <PlainContent content={item.content} />;
  }
}
