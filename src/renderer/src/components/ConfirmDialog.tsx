import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@renderer/components/ui/dialog";
import { Button } from "@renderer/components/ui/button";
import { useTranslation } from "react-i18next";

type ConfirmDialogProps = {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({ open, message, onConfirm, onCancel }: ConfirmDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-xs"
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogTitle className="text-center text-base leading-snug">{message}</DialogTitle>
        <DialogFooter className="sm:justify-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {t("common.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
