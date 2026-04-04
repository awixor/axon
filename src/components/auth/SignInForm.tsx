"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { GitHubIcon } from "@/components/icons";
import { signInWithGitHub } from "@/actions/auth";

export function SignInForm({
  registered,
  verified,
  reset,
  error: urlError,
}: {
  registered?: boolean;
  verified?: boolean;
  reset?: boolean;
  error?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (registered)
      toast.success("Account created! Check your email to verify.", {
        id: "registered",
      });
    if (verified)
      toast.success("Email verified! You can now sign in.", { id: "verified" });
    if (reset)
      toast.success("Password reset! You can now sign in.", { id: "reset" });
    if (urlError === "invalid_token" || urlError === "missing_token")
      toast.error("Invalid or missing verification link.", { id: "token_err" });
    if (urlError === "token_expired")
      toast.error("Verification link expired. Please register again.", {
        id: "token_expired",
      });
  }, [registered, verified, reset, urlError]);

  async function handleCredentials(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      if (result.code === "rate_limited") {
        setError("Too many attempts. Please wait before trying again.");
      } else {
        setError("Invalid email or password.");
      }
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
        <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your engineering knowledge hub
        </p>
      </div>

      <form action={signInWithGitHub}>
        <Button variant="outline" type="submit" className="w-full cursor-pointer">
          <GitHubIcon className="size-4" />
          Continue with GitHub
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-2 text-muted-foreground uppercase tracking-widest">
            or
          </span>
        </div>
      </div>

      <form onSubmit={handleCredentials} className="space-y-4">
        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="space-y-1.5">
          <FormField
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

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
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-foreground underline underline-offset-4 hover:text-emerald-400 transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
