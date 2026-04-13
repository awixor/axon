import AppShell from "@/components/layouts/AppShell";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
