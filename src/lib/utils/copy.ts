/**
 * Extracts the text that should be copied for a given item type.
 *
 * - RUNBOOK: joins the body of every fenced code block (commands only)
 * - RESOURCE: extracts the URL line
 * - Everything else: raw content
 */
export function extractCopyText(
  type: string,
  content: string,
): string {
  if (type === "RUNBOOK") {
    const blocks: string[] = [];
    const re = /^```[^\n]*\n([\s\S]*?)^```/gm;
    let m;
    while ((m = re.exec(content)) !== null) {
      const trimmed = m[1].trim();
      if (trimmed) blocks.push(trimmed);
    }
    return blocks.length > 0 ? blocks.join("\n\n") : content;
  }

  if (type === "RESOURCE") {
    const urlLine = content.split("\n").find((l) => l.startsWith("URL:"));
    return urlLine?.replace(/^URL:\s*/, "").trim() ?? content;
  }

  return content;
}
