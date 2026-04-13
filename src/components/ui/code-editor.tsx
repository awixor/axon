"use client";

import { useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { java } from "@codemirror/lang-java";
import { go } from "@codemirror/lang-go";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { sql } from "@codemirror/lang-sql";
import { json } from "@codemirror/lang-json";
import { xml } from "@codemirror/lang-xml";
import { markdown } from "@codemirror/lang-markdown";
import { cpp } from "@codemirror/lang-cpp";
import { type Extension } from "@codemirror/state";
import { Check, Copy } from "lucide-react";

const _js = javascript();
const _ts = javascript({ typescript: true });
const _jsx = javascript({ jsx: true });
const _tsx = javascript({ jsx: true, typescript: true });
const _py = python();
const _rs = rust();
const _cpp = cpp();
const _md = markdown();

const LANGUAGE_MAP: Record<string, Extension> = {
  javascript: _js,
  js: _js,
  typescript: _ts,
  ts: _ts,
  jsx: _jsx,
  tsx: _tsx,
  python: _py,
  py: _py,
  rust: _rs,
  rs: _rs,
  java: java(),
  go: go(),
  css: css(),
  html: html(),
  sql: sql(),
  json: json(),
  xml: xml(),
  markdown: _md,
  md: _md,
  cpp: _cpp,
  "c++": _cpp,
  c: _cpp,
};

type Props = {
  value: string;
  language?: string;
  onChange?: (value: string) => void;
  minHeight?: string;
  maxHeight?: string;
};

export function CodeEditor({
  value,
  language = "text",
  onChange,
  minHeight = "120px",
  maxHeight = "400px",
}: Props) {
  const [copied, setCopied] = useState(false);
  const readOnly = !onChange;

  const extensions = useMemo(() => {
    const ext = LANGUAGE_MAP[language.toLowerCase()];
    return ext ? [ext] : [];
  }, [language]);

  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-md overflow-hidden border border-border text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
          {language}
        </span>
        <button
          onClick={handleCopy}
          title={copied ? "Copied!" : "Copy"}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <CodeMirror
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        theme={vscodeDark}
        extensions={extensions}
        minHeight={minHeight}
        maxHeight={maxHeight}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          highlightActiveLine: !readOnly,
          highlightSelectionMatches: false,
        }}
        style={{ fontSize: "12px" }}
      />
    </div>
  );
}
