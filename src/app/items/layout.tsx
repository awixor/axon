import AppShell from "@/components/layouts/AppShell";

export default function ItemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
