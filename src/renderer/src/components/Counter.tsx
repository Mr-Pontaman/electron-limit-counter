import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AddItemForm } from "./counter/AddItemForm";
import { AlarmButton } from "./counter/AlarmButton";
import { ItemCard } from "./counter/ItemCard";
import { AlertDialog } from "./AlertDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import { useAlarmAudio } from "../hooks/useAlarmAudio";
import { Item } from "@renderer/types";

const Counter = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<Item[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const [confirmKey, setConfirmKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { isAlarmOn, stopAlarmAndHide } = useAlarmAudio(items);

  const handleAlarmClick = () => {
    setDialogKey((k) => k + 1);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    stopAlarmAndHide();
  };

  const loadItems = async () => {
    try {
      const fetchedItems = await window.api.getItems();
      setItems(fetchedItems || []);
    } catch (error) {
      console.error("Failed to load items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadItems();
    });
  }, []);

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      return;
    }

    try {
      const result = await window.api.addItem(newItemName);
      if (result.success) {
        setNewItemName("");
        await loadItems();
      } else {
        await window.api.showMessageBox(result.error || t("counter.addFailed"));
      }
    } catch (error) {
      console.error("Failed to add item:", error);
      await window.api.showMessageBox(t("counter.addFailed"));
    }
  };

  const handleDeleteItem = (itemName: string) => {
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
        await window.api.showMessageBox(result.error || t("counter.deleteFailed"));
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
      await window.api.showMessageBox(t("counter.deleteFailed"));
    }
  };

  const handleIncrement = async (itemName: string) => {
    try {
      const newCount = await window.api.incrementCount(itemName);
      const item = items.find((i) => i.name === itemName);
      if (item) {
        item.count = newCount;
        setItems([...items]);
      }
    } catch (error) {
      console.error("Failed to increment count:", error);
    }
  };

  const handleDecrement = async (itemName: string) => {
    setConfirmKey((k) => k + 1);
    setConfirmTarget(itemName);
  };

  const handleConfirmDecrement = async () => {
    if (!confirmTarget) return;
    const itemName = confirmTarget;
    setConfirmTarget(null);
    try {
      const newCount = await window.api.decrementCount(itemName);
      const item = items.find((i) => i.name === itemName);
      if (item) {
        item.count = newCount;
        setItems([...items]);
      }
    } catch (error) {
      console.error("Failed to decrement count:", error);
    }
  };

  const handleSetLimit = async (itemName: string, newLimit: number) => {
    try {
      const result = await window.api.setLimit(itemName, newLimit);
      if (!result.success) {
        await window.api.showMessageBox(result.error || t("counter.addFailed"));
        return;
      }
      const item = items.find((i) => i.name === itemName);
      if (item) {
        item.limit = newLimit;
        setItems([...items]);
      }
    } catch (error) {
      console.error("Failed to set limit:", error);
    }
  };

  if (loading) {
    return <div className="p-4">{t("counter.loading")}</div>;
  }

  return (
    <div className="grid gap-10">
      <AlertDialog
        key={dialogKey}
        open={isDialogOpen}
        onClose={handleDialogClose}
        message={t("counter.tomorrowMessage")}
      />
      <AlertDialog
        key={`confirm-${confirmKey}`}
        open={confirmTarget !== null}
        onClose={handleConfirmDecrement}
        message={t("counter.decrementConfirm")}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        message={t("counter.deleteConfirm", { name: deleteTarget ?? "" })}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <AlarmButton isVisible={isAlarmOn} onClick={handleAlarmClick} />
      <AddItemForm
        value={newItemName}
        onChange={setNewItemName}
        onSubmit={handleAddItem}
        isAlarmOn={isAlarmOn}
      />

      {/* アイテム一覧 */}
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">{t("counter.noItems")}</div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <ItemCard
              key={item.name}
              item={item}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onSetLimit={handleSetLimit}
              onDelete={handleDeleteItem}
              isAlarmOn={isAlarmOn}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Counter;
