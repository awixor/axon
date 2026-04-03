"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    router.push(data.emailVerificationRequired ? "/verify-email" : "/login?registered=true");
  }

  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-6 shadow-sm">
      {/* Mobile logo */}
      <div className="flex items-center gap-2.5 lg:hidden">
        <div className="size-7 rounded bg-emerald-500 flex items-center justify-center shrink-0">
          <span className="text-black text-[11px] font-bold font-mono leading-none">
            AX
          </span>
        </div>
        <span className="font-mono font-bold text-base tracking-widest uppercase">
          Axon
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Join your team on Axon
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="name"
          label="Name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <FormField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
        />

        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground"
          >
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full cursor-pointer"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-4 hover:text-emerald-400 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
