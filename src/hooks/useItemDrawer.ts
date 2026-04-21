"use client";

import { useState, useOptimistic, startTransition } from "react";
import { type ItemRow, type ItemDetail } from "@/lib/db/items";

export function useItemDrawer(items: ItemRow[]) {
  const [optimisticItems, removeOptimisticItem] = useOptimistic(
    items,
    (current, deletedId: string) => current.filter((i) => i.id !== deletedId),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [itemDetail, setItemDetail] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  async function handleOpen(id: string) {
    setSelectedId(id);
    setDrawerOpen(true);
    setLoading(true);
    setItemDetail(null);
    setFetchError(false);
    try {
      const res = await fetch(`/api/items/${id}`);
      if (res.ok) {
        setItemDetail((await res.json()) as ItemDetail);
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

  function handleItemDeleted(itemId: string) {
    startTransition(() => removeOptimisticItem(itemId));
  }

  function handleItemSaved(updated: ItemDetail) {
    setItemDetail(updated);
  }

  return {
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
  };
}
