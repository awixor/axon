"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CodeEditor } from "@/components/ui/code-editor";
import { TYPE_CONFIG, ITEM_TYPES } from "@/lib/type-config";
import { cn } from "@/lib/utils";
import { createItem } from "@/actions/items";
import type { SpaceOption } from "@/lib/db/spaces";
import type { ItemType } from "@/types/items";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaces: SpaceOption[];
  defaultType?: ItemType;
};

type SecretPair = { key: string; value: string };

type FormErrors = Partial<Record<string, string[]>>;

const FIELD_LABELS: Record<ItemType, string> = {
  SNIPPET: "Code",
  RUNBOOK: "Markdown content",
  DOC: "Markdown content",
  BLUEPRINT: "Template text",
  SECRET_REF: "Secret pairs",
  RESOURCE: "URL",
  ASSET: "",
};

export function NewItemDialog({
  open,
  onOpenChange,
  spaces,
  defaultType,
}: Props) {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(defaultType ? 2 : 1);
  const [selectedType, setSelectedType] = useState<ItemType | null>(
    defaultType ?? null,
  );

  // Form fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [secretPairs, setSecretPairs] = useState<SecretPair[]>([
    { key: "", value: "" },
  ]);
  const [selectedSpaceIds, setSelectedSpaceIds] = useState<string[]>([]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  function reset() {
    setStep(defaultType ? 2 : 1);
    setSelectedType(defaultType ?? null);
    setTitle("");
    setContent("");
    setLanguage("");
    setUrl("");
    setNotes("");
    setSecretPairs([{ key: "", value: "" }]);
    setSelectedSpaceIds([]);
    setErrors({});
    setSaving(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function selectType(type: ItemType) {
    setSelectedType(type);
    setStep(2);
  }

  function goBack() {
    setStep(1);
    setErrors({});
  }

  function toggleSpace(id: string) {
    setSelectedSpaceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  function addSecretPair() {
    setSecretPairs((prev) => [...prev, { key: "", value: "" }]);
  }

  function removeSecretPair(i: number) {
    setSecretPairs((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateSecretPair(i: number, field: "key" | "value", val: string) {
    setSecretPairs((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)),
    );
  }

  async function handleSubmit() {
    if (!selectedType) return;
    setSaving(true);
    setErrors({});

    const result = await createItem({
      type: selectedType,
      title,
      content,
      language: language || null,
      url: url || null,
      notes: notes || null,
      secretPairs,
      spaceIds: selectedSpaceIds,
    });

    setSaving(false);

    if (result.success) {
      toast.success("Item created");
      handleOpenChange(false);
      router.refresh();
    } else {
      if (typeof result.error === "string") {
        toast.error(result.error);
      } else {
        setErrors(result.error as FormErrors);
      }
    }
  }

  const config = selectedType ? TYPE_CONFIG[selectedType] : null;
  const Icon = config?.icon;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle>New Item</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {ITEM_TYPES.map((type) => {
                const cfg = TYPE_CONFIG[type];
                const Ico = cfg.icon;
                return (
                  <button
                    key={type}
                    onClick={() => selectType(type)}
                    className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-border hover:border-foreground/20 hover:bg-muted/50 transition-colors text-center"
                  >
                    <div
                      className="flex items-center justify-center size-10 rounded-lg"
                      style={{ backgroundColor: `${cfg.color}18` }}
                    >
                      <Ico className="size-5" style={{ color: cfg.color }} />
                    </div>
                    <span className="text-xs font-medium">{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                {!defaultType && (
                  <button
                    onClick={goBack}
                    className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft size={15} />
                    <span className="sr-only">Back</span>
                  </button>
                )}
                {Icon && config && (
                  <div className="flex items-center gap-1.5">
                    <Icon size={13} style={{ color: config.color }} />
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: config.color }}
                    >
                      {config.label}
                    </span>
                  </div>
                )}
              </div>
              <DialogTitle>New {config?.label}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              {/* Title — all types */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Title <span className="text-destructive">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`${config?.label} title`}
                  autoFocus
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title[0]}</p>
                )}
              </div>

              {/* SNIPPET */}
              {selectedType === "SNIPPET" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Language
                    </label>
                    <Input
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      placeholder="e.g. typescript, python, sql"
                      className="font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Code <span className="text-destructive">*</span>
                    </label>
                    <CodeEditor
                      value={content}
                      language={language}
                      onChange={setContent}
                      minHeight="200px"
                      maxHeight="400px"
                    />
                    {errors.content && (
                      <p className="text-xs text-destructive">
                        {errors.content[0]}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* RUNBOOK, DOC, BLUEPRINT */}
              {(selectedType === "RUNBOOK" ||
                selectedType === "DOC" ||
                selectedType === "BLUEPRINT") && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {FIELD_LABELS[selectedType]}{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-xs font-mono focus:outline-none focus:ring-3 focus:ring-ring/50 focus:border-ring resize-none"
                    placeholder={
                      selectedType === "BLUEPRINT"
                        ? "Paste your template text…"
                        : "Write in markdown…"
                    }
                  />
                  {errors.content && (
                    <p className="text-xs text-destructive">
                      {errors.content[0]}
                    </p>
                  )}
                </div>
              )}

              {/* RESOURCE */}
              {selectedType === "RESOURCE" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      URL <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://…"
                      className="font-mono"
                    />
                    {errors.url && (
                      <p className="text-xs text-destructive">
                        {errors.url[0]}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={5}
                      className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-xs focus:outline-none focus:ring-3 focus:ring-ring/50 focus:border-ring resize-none"
                      placeholder="Optional notes…"
                    />
                  </div>
                </>
              )}

              {/* SECRET_REF */}
              {selectedType === "SECRET_REF" && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Secret pairs
                  </label>
                  <div className="flex flex-col gap-2">
                    {secretPairs.map((pair, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <Input
                          value={pair.key}
                          onChange={(e) =>
                            updateSecretPair(i, "key", e.target.value)
                          }
                          placeholder="KEY"
                          className="font-mono text-xs flex-1"
                        />
                        <Input
                          value={pair.value}
                          onChange={(e) =>
                            updateSecretPair(i, "value", e.target.value)
                          }
                          placeholder="value"
                          className="text-xs flex-1"
                        />
                        {secretPairs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSecretPair(i)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addSecretPair}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors self-start"
                  >
                    <Plus size={13} />
                    Add pair
                  </button>
                </div>
              )}

              {/* ASSET — locked */}
              {selectedType === "ASSET" && (
                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3">
                  <Lock
                    size={14}
                    className="text-muted-foreground mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-xs font-medium">
                      File uploads require Team Pro
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      You can create an Asset with a title now and attach a file
                      after upgrading.
                    </p>
                  </div>
                </div>
              )}

              {/* Spaces */}
              {spaces.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Spaces
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {spaces.map((space) => {
                      const selected = selectedSpaceIds.includes(space.id);
                      return (
                        <button
                          key={space.id}
                          type="button"
                          onClick={() => toggleSpace(space.id)}
                          style={{ "--c": space.color } as React.CSSProperties}
                          className={cn(
                            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                            selected
                              ? "border-(--c) text-(--c) bg-(--c)/10"
                              : "border-border text-muted-foreground hover:bg-muted/50 hover:border-foreground/20",
                          )}
                        >
                          <span className="size-1.5 rounded-full shrink-0 bg-(--c)" />
                          {space.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={saving || !title.trim()}
              >
                {saving ? "Creating…" : "Create"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
