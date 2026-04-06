"use client";

import { useState } from "react";
import { type ItemRow, type ItemDetail } from "@/lib/db/items";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { ItemDrawer } from "@/components/dashboard/ItemDrawer";

type Props = {
  items: ItemRow[];
  emptyMessage?: string;
};

export function ItemsGrid({ items, emptyMessage = "No items found." }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [itemDetail, setItemDetail] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  async function handleCardClick(id: string) {
    setSelectedId(id);
    setDrawerOpen(true);
    setLoading(true);
    setItemDetail(null);
    setFetchError(false);

    try {
      const res = await fetch(`/api/items/${id}`);
      if (res.ok) {
        const data: ItemDetail = await res.json();
        setItemDetail(data);
      } else {
        setFetchError(true);
      }
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(open: boolean) {
    setDrawerOpen(open);
    if (!open) {
      setSelectedId(null);
      setItemDetail(null);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            selected={item.id === selectedId}
            onClick={() => handleCardClick(item.id)}
          />
        ))}
        {items.length === 0 && (
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
      />
    </>
  );
}
