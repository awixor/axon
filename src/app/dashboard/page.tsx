export default function DashboardPage() {
  return (
    <>
      <aside className="w-64 border-r border-border shrink-0 p-4">
        <h2 className="text-lg font-semibold">Sidebar</h2>
      </aside>
      <main className="flex-1 overflow-auto p-4">
        <h2 className="text-lg font-semibold">Main</h2>
      </main>
    </>
  );
}
