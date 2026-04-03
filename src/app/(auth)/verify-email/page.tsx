import { MailCheck } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Check your email - Axon" };

export default function VerifyEmailPage() {
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

      <div className="flex flex-col items-center text-center space-y-3 py-2">
        <div className="size-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <MailCheck className="size-6 text-emerald-500" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a verification link to your email address. Click it to
            activate your account.
          </p>
        </div>
      </div>

      <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground space-y-1">
        <p>The link expires in <span className="font-medium text-foreground">24 hours</span>.</p>
        <p>Check your spam folder if you don&apos;t see it.</p>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already verified?{" "}
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
