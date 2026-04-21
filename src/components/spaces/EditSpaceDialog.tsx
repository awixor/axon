"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, Globe, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateSpace } from "@/actions/spaces";
import {
  SPACE_COLOR_PRESETS,
  SpaceColor,
  SpaceVisibility,
} from "@/lib/space-config";

const VISIBILITY_OPTIONS = [
  {
    value: SpaceVisibility.PrivateToTeam,
    label: "Private to Team",
    description: "Only team members can access",
    icon: Lock,
  },
  {
    value: SpaceVisibility.Public,
    label: "Public",
    description: "Anyone with the link can view",
    icon: Globe,
  },
];

type EditSpaceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  space: {
    id: string;
    name: string;
    description: string | null;
    color: string;
    visibility: "PUBLIC" | "PRIVATE_TO_TEAM";
  };
};

export function EditSpaceDialog({
  open,
  onOpenChange,
  space,
}: EditSpaceDialogProps) {
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(space.name);
  const [description, setDescription] = useState(space.description ?? "");
  const [color, setColor] = useState<SpaceColor>(
    (SPACE_COLOR_PRESETS.includes(space.color as SpaceColor)
      ? space.color
      : SPACE_COLOR_PRESETS[0]) as SpaceColor,
  );
  const [visibility, setVisibility] = useState<SpaceVisibility>(
    space.visibility,
  );

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateSpace(space.id, {
        name,
        description: description || null,
        color,
        visibility,
      });
      if (result.success) {
        toast.success("Space updated");
        onOpenChange(false);
      } else {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to update space",
        );
      }
    });
  }

  return (
    <Dialog key={open ? space.id : "closed"} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <div
          className="h-1 w-full transition-colors duration-200"
          style={{ backgroundColor: color }}
        />

        <div className="p-6">
          <DialogHeader className="mb-5">
            <DialogTitle className="text-base font-semibold tracking-tight">
              Edit Space
            </DialogTitle>
          </DialogHeader>

          {/* Live preview */}
          <div className="mb-5 rounded-lg border border-border bg-muted/30 px-4 py-3 flex items-center gap-3">
            <div
              className="size-8 rounded-md shrink-0 transition-colors duration-200"
              style={{ backgroundColor: color }}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate leading-none">
                {name.trim() || (
                  <span className="text-muted-foreground font-normal">
                    Space name
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {description.trim() || "No description"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-space-name">Name</Label>
                <span
                  className={`text-xs tabular-nums transition-colors ${
                    name.length > 90
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {name.length}/100
                </span>
              </div>
              <Input
                id="edit-space-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-space-desc">
                  Description{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {description.length}/500
                </span>
              </div>
              <Textarea
                id="edit-space-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this space for?"
                rows={2}
                maxLength={500}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap" role="group" aria-label="Color presets">
                {SPACE_COLOR_PRESETS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setColor(item)}
                    aria-label={`Select color ${item}`}
                    aria-pressed={color === item}
                    className="relative size-9 rounded-md cursor-pointer transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    style={{ backgroundColor: item }}
                  >
                    {color === item && (
                      <Check
                        size={14}
                        strokeWidth={3}
                        className="absolute inset-0 m-auto text-white drop-shadow-sm"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Visibility options">
                {VISIBILITY_OPTIONS.map(
                  ({ value, label, description: desc, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setVisibility(value)}
                      aria-pressed={visibility === value}
                      className={`relative flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                        visibility === value
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-muted-foreground/40 hover:bg-accent/50"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        <Icon size={13} />
                        {label}
                      </span>
                      <span className="text-xs text-muted-foreground leading-tight">
                        {desc}
                      </span>
                      {visibility === value && (
                        <Check
                          size={12}
                          strokeWidth={2.5}
                          className="absolute top-2 right-2 text-primary"
                        />
                      )}
                    </button>
                  ),
                )}
              </div>
            </div>

            <DialogFooter className="pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending || !name.trim()}
                className="min-w-27.5"
              >
                {isPending ? (
                  <>
                    <Loader2 size={13} className="animate-spin mr-1.5" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
