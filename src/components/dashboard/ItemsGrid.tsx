"use client";

import { type ItemRow } from "@/lib/db/items";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { ItemDrawer } from "@/components/dashboard/ItemDrawer";
import { useItemDrawer } from "@/hooks/useItemDrawer";

type Props = {
  items: ItemRow[];
  emptyMessage?: string;
};

export function ItemsGrid({ items, emptyMessage = "No items found." }: Props) {
  const {
    optimisticItems,
    selectedId,
    drawerOpen,
    itemDetail,
    loading,
    fetchError,
    handleOpen,
    handleOpenChange,
    handleItemDeleted,
    handleItemSaved,
  } = useItemDrawer(items);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {optimisticItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            selected={item.id === selectedId}
            onClick={() => handleOpen(item.id)}
          />
        ))}
        {optimisticItems.length === 0 && (
          <p className="text-xs text-muted-foreground col-span-3 py-4">
            {emptyMessage}
          </p>
        )}
      </div>

      <ItemDrawer
        key={selectedId ?? "drawer"}
        open={drawerOpen}
        onOpenChange={handleOpenChange}
        item={itemDetail}
        loading={loading}
        error={fetchError}
        onItemSaved={handleItemSaved}
        onItemDeleted={handleItemDeleted}
      />
    </>
  );
}
