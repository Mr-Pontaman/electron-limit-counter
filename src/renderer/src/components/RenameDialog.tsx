import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@renderer/components/ui/dialog";
import { Button } from "@renderer/components/ui/button";
import { Input } from "@renderer/components/ui/input";

/** メインプロセスの itemNameSchema と同じ上限 */
export const ITEM_NAME_MAX_LENGTH = 20;

type RenameDialogProps = {
  open: boolean;
  currentName: string;
  /** 既存のアイテム名。重複をその場で知らせるために使う（メイン側のチェックが最後の砦） */
  existingNames: string[];
  onConfirm: (newName: string) => void;
  onCancel: () => void;
};

export const RenameDialog = ({
  open,
  currentName,
  existingNames,
  onConfirm,
  onCancel
}: RenameDialogProps) => {
  const { t } = useTranslation();
  // 親が key で再マウントするので、初期値はこれで足りる
  const [value, setValue] = useState(currentName);

  const trimmed = value.trim();
  const isDuplicate = trimmed !== currentName && existingNames.includes(trimmed);
  const canSave = trimmed.length > 0 && trimmed !== currentName && !isDuplicate;

  const handleSubmit = () => {
    if (!canSave) return;
    onConfirm(trimmed);
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-xs"
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>{t("counter.renameTitle")}</DialogTitle>
        </DialogHeader>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          maxLength={ITEM_NAME_MAX_LENGTH}
          aria-invalid={isDuplicate}
          autoFocus
        />
        <p className="min-h-5 text-xs text-destructive">
          {isDuplicate ? t("counter.renameDuplicate") : ""}
        </p>
        <DialogFooter className="sm:justify-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSave}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
