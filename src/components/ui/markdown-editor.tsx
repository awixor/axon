"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { MarkdownContent } from "@/components/dashboard/ItemContentRenderers";

type Props = {
  value: string;
  onChange?: (value: string) => void;
  minHeight?: string;
  maxHeight?: string;
  placeholder?: string;
};

export function MarkdownEditor({
  value,
  onChange,
  minHeight = "120px",
  maxHeight = "400px",
  placeholder = "Write in markdown…",
}: Props) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [copied, setCopied] = useState(false);
  const readOnly = !onChange;

  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-md overflow-hidden border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border">
        {!readOnly ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setTab("write")}
                className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                  tab === "write"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Write
              </button>
              <button
                onClick={() => setTab("preview")}
                className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                  tab === "preview"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Preview
              </button>
            </div>
          </div>
        ) : (
          <span />
        )}
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
      {readOnly || tab === "preview" ? (
        <div
          className="px-3 py-2.5 overflow-y-auto"
          style={{ maxHeight }}
        >
          <MarkdownContent content={value} />
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange!(e.target.value)}
          className="bg-transparent px-3 py-2.5 text-xs font-mono focus:outline-none resize-none w-full"
          style={{ minHeight, maxHeight }}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
