import { useCounter } from "@renderer/hooks/useCounter";
import { AddItemForm } from "./counter/AddItemForm";
import { AlarmButton } from "./counter/AlarmButton";
import { ItemCard } from "./counter/ItemCard";
import { AlertDialog } from "./AlertDialog";
import { ConfirmDialog } from "./ConfirmDialog";

const Counter = ({ t }: { t: (key: string) => string }) => {
  const {
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
    handleSetLimit
  } = useCounter({ t });

  if (initialError) {
    return <div className="p-4 text-center text-red-500 font-medium">Error loading items</div>;
  }

  return (
    <div className="grid gap-10">
      {/* 逃げるカーソルのDialog */}
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

      {/* 削除用のDialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        message={(t as any)("counter.deleteConfirm", { name: deleteTarget ?? "" })}
        onConfirm={handleConfirmDelete}
        onCancel={() => handleDeleteRequest(null)}
      />

      <AlarmButton isVisible={isAlarmOn} onClick={handleAlarmClick} />
      <AddItemForm
        value={newItemName}
        onChange={setNewItemName}
        onSubmit={handleAddItem}
        isAlarmOn={isAlarmOn}
        t={t}
      />

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
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Counter;
