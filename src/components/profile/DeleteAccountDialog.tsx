"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);

    const res = await fetch("/api/auth/delete-account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error ?? "Failed to delete account.");
      return;
    }

    toast.success("Account deleted.");
    await signOut({ callbackUrl: "/login" });
  }

  if (!open) {
    return (
      <Button
        variant="destructive"
        onClick={() => setOpen(true)}
        className="cursor-pointer"
      >
        Delete account
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 space-y-4">
      <div className="flex items-start gap-3">
        <TriangleAlert className="size-4 text-destructive mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-destructive-foreground">
            This action is permanent
          </p>
          <p className="text-xs text-muted-foreground">
            Your account and all associated data will be deleted immediately.
            Type{" "}
            <span className="font-mono font-semibold text-foreground">
              DELETE
            </span>{" "}
            to confirm.
          </p>
        </div>
      </div>

      <FormField
        id="deleteConfirmation"
        label="Confirmation"
        type="text"
        placeholder="DELETE"
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
      />

      <div className="flex gap-2">
        <Button
          variant="destructive"
          disabled={loading || confirmation !== "DELETE"}
          onClick={handleDelete}
          className="cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Deleting…
            </>
          ) : (
            "Permanently delete"
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setOpen(false);
            setConfirmation("");
          }}
          className="cursor-pointer"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
