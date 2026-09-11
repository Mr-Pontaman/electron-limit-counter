import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@renderer/components/ui/dialog";
import { Button } from "@renderer/components/ui/button";
import { useFleeButton } from "@renderer/hooks/useFleeButton";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  message?: string;
};

export const AlertDialog = ({ open, onClose, title, message }: DialogProps) => {
  const { offset, buttonRef, handleMouseMove } = useFleeButton();

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-xs overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
        onMouseMove={handleMouseMove}
      >
        <DialogTitle className="text-center text-lg">{title}</DialogTitle>
        <DialogFooter className="sm:justify-center">
          <Button
            ref={buttonRef}
            onClick={onClose}
            className="w-max transition-none cursor-pointer hover:ring-2 hover:ring-primary"
            style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
          >
            {message || "OK"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
