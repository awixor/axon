import { Code2, FileText, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: Code2,
    label: "Snippets & Runbooks",
    desc: "Shared code patterns and step-by-step terminal procedures.",
  },
  {
    icon: ShieldCheck,
    label: "Secure Secret Refs",
    desc: "Pointers to external stores — no raw secrets, ever.",
  },
  {
    icon: FileText,
    label: "Team Documentation",
    desc: "Long-form docs and architecture assets, versioned and searchable.",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2">
      {/* Left branding panel — desktop only */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-950 border-r border-border px-12 py-10">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded bg-emerald-500 flex items-center justify-center shrink-0">
            <span className="text-black text-[11px] font-bold font-mono leading-none">AX</span>
          </div>
          <span className="font-mono font-bold text-base tracking-widest uppercase">Axon</span>
        </div>

        {/* Center content */}
        <div className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold leading-snug tracking-tight">
              The central nervous system for your team&apos;s knowledge.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Eliminate knowledge silos. Secure your team&apos;s engineering
              assets in one encrypted hub.
            </p>
          </div>
          <ul className="space-y-5">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <li key={label} className="flex gap-3">
                <div className="mt-0.5 shrink-0 text-emerald-500">
                  <Icon className="size-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground font-mono">
          Open-source · Self-hostable · Built for engineers
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex min-h-dvh items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
