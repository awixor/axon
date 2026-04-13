"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { MarkdownContent } from "@/components/dashboard/ItemContentRenderers";
import { extractCopyText } from "@/lib/utils/copy";

type Props = {
  value: string;
  onChange?: (value: string) => void;
  itemType?: string;
  minHeight?: string;
  maxHeight?: string;
  placeholder?: string;
};

export function MarkdownEditor({
  value,
  onChange,
  itemType,
  minHeight = "120px",
  maxHeight = "400px",
  placeholder = "Write in markdown…",
}: Props) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [copied, setCopied] = useState(false);
  const readOnly = !onChange;

  function handleCopy() {
    const text = itemType ? extractCopyText(itemType, value) : value;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (readOnly) {
    return <MarkdownContent content={value} />;
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Toolbar — no macOS dots, just tabs + copy */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/40 rounded-md border border-border">
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setTab("write")}
            className={`text-[10px] px-2.5 py-1 rounded transition-colors ${
              tab === "write"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Write
          </button>
          <button
            onClick={() => setTab("preview")}
            className={`text-[10px] px-2.5 py-1 rounded transition-colors ${
              tab === "preview"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Preview
          </button>
        </div>
        <button
          onClick={handleCopy}
          title={copied ? "Copied!" : "Copy"}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Content */}
      {tab === "preview" ? (
        <div
          className="overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent"
          style={{ maxHeight }}
        >
          <MarkdownContent content={value} />
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange!(e.target.value)}
          className="bg-muted/20 border border-border rounded-md px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring resize-none w-full"
          style={{ minHeight, maxHeight }}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
