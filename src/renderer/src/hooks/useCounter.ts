import { useState, useEffect } from "react";
import { useAlarmAudio } from "./useAlarmAudio";
import { Item } from "@renderer/types";
import { toast } from "sonner";

export const useCounter = ({ t }: { t: (key: string) => string }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [initialError, setInitialError] = useState(false);

  // ダイアログまわりの状態
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const [confirmKey, setConfirmKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { isAlarmOn, stopAlarmAndHide } = useAlarmAudio(items);

  const loadItems = async () => {
    try {
      const fetchedItems = await window.api.getItems();
      setItems(fetchedItems || []);
      setInitialError(false);
    } catch (_error) {
      setInitialError(true);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadItems();
    });
  }, []);

  const handleAlarmClick = () => {
    setDialogKey((k) => k + 1);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    stopAlarmAndHide();
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;
    try {
      const result = await window.api.addItem(newItemName);
      if (result.success) {
        setNewItemName("");
        await loadItems();
      } else {
        toast.error(t("counter.addFailed"));
      }
    } catch (error) {
      console.error("Failed to add item:", error);
      toast.error(t("counter.addFailed"));
    }
  };

  const handleDeleteRequest = (itemName: string | null) => {
    setDeleteTarget(itemName);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const itemName = deleteTarget;
    setDeleteTarget(null);
    try {
      const result = await window.api.deleteItem(itemName);
      if (result.success) {
        await loadItems();
      } else {
        toast.error(t("counter.deleteFailed"));
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error(t("counter.deleteFailed"));
    }
  };

  const handleIncrement = async (itemName: string) => {
    try {
      const newCount = await window.api.incrementCount(itemName);
      setItems((prev) => prev.map((i) => (i.name === itemName ? { ...i, count: newCount } : i)));
    } catch (error) {
      console.error("Failed to increment count:", error);
    }
  };

  const handleDecrement = (itemName: string) => {
    setConfirmKey((k) => k + 1);
    setConfirmTarget(itemName);
  };

  const handleConfirmDecrement = async () => {
    if (!confirmTarget) return;
    const itemName = confirmTarget;
    setConfirmTarget(null);
    try {
      const newCount = await window.api.decrementCount(itemName);
      setItems((prev) => prev.map((i) => (i.name === itemName ? { ...i, count: newCount } : i)));
    } catch (error) {
      console.error("Failed to decrement count:", error);
    }
  };

  const handleSetLimit = async (itemName: string, newLimit: number) => {
    try {
      const result = await window.api.setLimit(itemName, newLimit);
      if (!result.success) {
        toast.error(t("counter.addFailed"));
        return;
      }
      setItems((prev) => prev.map((i) => (i.name === itemName ? { ...i, limit: newLimit } : i)));
    } catch (error) {
      console.error("Failed to set limit:", error);
    }
  };

  return {
    items,
    newItemName,
    setNewItemName,
    initialError,
    isDialogOpen,
    dialogKey,
    confirmTarget,
    confirmKey,
    deleteTarget,
    isAlarmOn,
    handleAlarmClick,
    handleDialogClose,
    handleAddItem,
    handleDeleteRequest,
    handleConfirmDelete,
    handleIncrement,
    handleDecrement,
    handleConfirmDecrement,
    handleSetLimit,
    t
  };
};
