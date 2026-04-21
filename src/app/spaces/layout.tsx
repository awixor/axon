import AppShell from "@/components/layouts/AppShell";

export default function SpacesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
