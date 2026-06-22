import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useItemStore } from "@renderer/stores/itemStore";
import { useAlarmStore } from "@renderer/stores/alarmStore";
import { toast } from "sonner";
import { AlertDialog } from "../AlertDialog";
import { ConfirmDialog } from "../ConfirmDialog";
import { AlarmButton } from "./AlarmButton";
import { AddItemForm } from "./AddItemForm";
import { ItemCard } from "./ItemCard";

const Counter = () => {
  const { t } = useTranslation();
  const { items, loading, error, loadItems, addItem, deleteItem, incrementCount, decrementCount, setLimit } =
    useItemStore();
  const { isAlarmOn, checkItems, stopAlarmAndHide } = useAlarmStore();

  // ---- 初回ロード ----
  useEffect(() => {
    void loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- アラーム検出 ----
  useEffect(() => {
    checkItems(items);
  }, [items, checkItems]);

  // ---- ダイアログ状態（ローカル） ----
  const [newItemName, setNewItemName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const [confirmKey, setConfirmKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // ---- ハンドラ ----
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
    const ok = await addItem(newItemName);
    if (ok) {
      setNewItemName("");
    } else {
      toast.error(t("counter.addFailed"));
    }
  };

  const handleDeleteRequest = (itemName: string | null) => {
    setDeleteTarget(itemName);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const name = deleteTarget;
    setDeleteTarget(null);
    const ok = await deleteItem(name);
    if (!ok) {
      toast.error(t("counter.deleteFailed"));
    }
  };

  const handleIncrement = (itemName: string) => {
    void incrementCount(itemName);
  };

  const handleDecrement = (itemName: string) => {
    setConfirmKey((k) => k + 1);
    setConfirmTarget(itemName);
  };

  const handleConfirmDecrement = async () => {
    if (!confirmTarget) return;
    const name = confirmTarget;
    setConfirmTarget(null);
    await decrementCount(name);
  };

  const handleSetLimit = (itemName: string, newLimit: number) => {
    void setLimit(itemName, newLimit);
  };

  // ---- レンダリング ----
  if (error) {
    return <div className="p-4 text-center text-red-500 font-medium">Error loading items</div>;
  }

  if (loading) {
    return <div className="p-4 text-center text-gray-500">{t("counter.loading")}</div>;
  }

  return (
    <div className="grid gap-10">
      <AlertDialog
        key={dialogKey}
        open={isDialogOpen}
        onClose={handleDialogClose}
        title={t("counter.tomorrowMessage")}
        message="OK"
      />
      <AlertDialog
        key={`confirm-${confirmKey}`}
        open={confirmTarget !== null}
        onClose={handleConfirmDecrement}
        title={t("counter.decrementConfirm")}
        message="YES"
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        message={t("counter.deleteConfirm", { name: deleteTarget ?? "" })}
        onConfirm={handleConfirmDelete}
        onCancel={() => handleDeleteRequest(null)}
      />
      <AlarmButton isVisible={isAlarmOn} onClick={handleAlarmClick} />
      <AddItemForm value={newItemName} onChange={setNewItemName} onSubmit={handleAddItem} disabled={isAlarmOn} />
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
              onDelete={handleDeleteRequest}
              isAlarmOn={isAlarmOn}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Counter;
