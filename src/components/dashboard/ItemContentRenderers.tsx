"use client";

import { useState } from "react";
import { formatBytes } from "@/lib/format";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Download, Eye, EyeOff, ExternalLink, FileText } from "lucide-react";
import { type ItemDetail } from "@/lib/db/items";
import { CodeEditor } from "@/components/ui/code-editor";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import Image from "next/image";

export type ItemContentProps = { item: ItemDetail };

// ─── Snippet ──────────────────────────────────────────────────────────────────

export function SnippetContent({ item }: ItemContentProps) {
  return <CodeEditor value={item.content} language={item.language ?? "text"} />;
}

// ─── Runbook ──────────────────────────────────────────────────────────────────

export function RunbookContent({ item }: ItemContentProps) {
  return <MarkdownEditor value={item.content} />;
}

// ─── Doc ─────────────────────────────────────────────────────────────────────

export function DocContent({ item }: ItemContentProps) {
  return <MarkdownEditor value={item.content} />;
}

// ─── Resource ─────────────────────────────────────────────────────────────────

export function ResourceContent({ item }: ItemContentProps) {
  const lines = item.content.split("\n");
  const urlLine = lines.find((l) => l.startsWith("URL:"));
  const url = urlLine?.replace(/^URL:\s*/, "").trim();
  const notes = lines
    .filter((l) => !l.startsWith("URL:"))
    .join("\n")
    .trim();

  return (
    <div className="flex flex-col gap-3">
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2.5 text-xs text-foreground hover:bg-muted transition-colors break-all"
        >
          <ExternalLink size={13} className="shrink-0 text-muted-foreground" />
          <span className="font-mono">{url}</span>
        </a>
      )}
      {notes && (
        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {notes}
        </p>
      )}
    </div>
  );
}

// ─── Secret Ref ───────────────────────────────────────────────────────────────

export function SecretRefContent({ item }: ItemContentProps) {
  const [revealed, setRevealed] = useState(false);

  const lines = item.content
    .split("\n")
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return { label: null, value: line };
      return {
        label: line.slice(0, idx).trim(),
        value: line.slice(idx + 1).trim(),
      };
    })
    .filter((l) => l.label || l.value);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end mb-1">
        <button
          onClick={() => setRevealed((r) => !r)}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {revealed ? <EyeOff size={11} /> : <Eye size={11} />}
          {revealed ? "Hide values" : "Reveal values"}
        </button>
      </div>
      <div className="rounded-md border border-border overflow-hidden text-xs">
        {lines.map((line, i) => (
          <div
            key={i}
            className="flex gap-0 border-b border-border last:border-0"
          >
            {line.label && (
              <span className="min-w-35 px-3 py-2 font-medium bg-muted/30 border-r border-border text-muted-foreground shrink-0">
                {line.label}
              </span>
            )}
            <span
              className={
                "px-3 py-2 font-mono break-all " +
                (!revealed && line.label ? "blur-[3px] select-none" : "")
              }
            >
              {line.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Blueprint ────────────────────────────────────────────────────────────────

export function BlueprintContent({ item }: ItemContentProps) {
  return <MarkdownEditor value={item.content} />;
}

// ─── Asset ────────────────────────────────────────────────────────────────────

export function AssetContent({ item }: ItemContentProps) {
  const meta = item.assetMeta;

  if (!meta?.fileKey) {
    return <PlainContent content={item.content || "No file attached"} />;
  }

  const proxyUrl = `/api/files/${meta.fileKey}`;
  const isImage = meta.mimeType.startsWith("image/");

  return (
    <div className="flex flex-col gap-3">
      {isImage && (
        <div className="relative h-80 rounded-md overflow-hidden border border-border bg-muted/20">
          <Image
            src={proxyUrl}
            alt={meta.fileName}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      )}

      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
        <div
          className="flex items-center justify-center size-8 rounded-md shrink-0"
          style={{ backgroundColor: isImage ? "#60a5fa18" : "#6366f118" }}
        >
          <FileText
            size={14}
            style={{ color: isImage ? "#60a5fa" : "#6366f1" }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{meta.fileName}</p>
          <p className="text-[10px] text-muted-foreground">
            {formatBytes(meta.fileSize)} · {meta.mimeType}
          </p>
        </div>
        <a
          href={proxyUrl}
          download={meta.fileName}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Download size={13} />
          Download
        </a>
      </div>
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

export function PlainContent({ content }: { content: string }) {
  return (
    <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
      {content}
    </pre>
  );
}

export function MarkdownContent({
  content,
  codeTheme,
}: {
  content: string;
  codeTheme?: "terminal";
}) {
  return (
    <div className="prose-axon text-xs">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-sm font-semibold mb-2 mt-4 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xs font-semibold mb-1.5 mt-3 first:mt-0 text-muted-foreground uppercase tracking-wide">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-medium mb-1 mt-2">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-xs text-muted-foreground leading-relaxed mb-2 last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mb-2 space-y-0.5 pl-4">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 space-y-0.5 pl-4 list-decimal">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-xs text-muted-foreground leading-relaxed">
              {children}
            </li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {children}
            </a>
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className ?? "");
            const isBlock = !!match;
            if (!isBlock) {
              return (
                <code
                  className="bg-muted px-1 py-0.5 rounded text-[11px] font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            const lang = match[1];
            const isTerminal =
              codeTheme === "terminal" || lang === "bash" || lang === "sh";
            return (
              <div className="my-2 rounded-md overflow-hidden border border-border">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 border-b border-border">
                  {isTerminal && (
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500/60" />
                      <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
                      <span className="w-2 h-2 rounded-full bg-green-500/60" />
                    </div>
                  )}
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider ml-auto">
                    {lang}
                  </span>
                </div>
                <SyntaxHighlighter
                  language={lang}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    fontSize: "11px",
                    background: "transparent",
                    padding: "0.75rem 1rem",
                  }}
                  codeTagProps={{
                    style: { fontFamily: "var(--font-mono, monospace)" },
                  }}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            );
          },
          pre: ({ children }) => <>{children}</>,
          hr: () => <hr className="border-border my-3" />,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-border pl-3 text-muted-foreground italic my-2">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="text-xs border-collapse w-full">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead>{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-border">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-1.5 text-left font-semibold bg-muted/30 border border-border">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-1.5 border border-border text-muted-foreground">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
