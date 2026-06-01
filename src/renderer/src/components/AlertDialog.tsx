import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@renderer/components/ui/dialog";
import { Button } from "@renderer/components/ui/button";
import { useRef, useState } from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  message?: string;
};

const FLEE_RADIUS = 100; // この距離以内でボタンが逃げ始める (px)
const MAX_OFFSET_X = 100; // X方向の最大逃げ幅
const MAX_OFFSET_Y = 45; // Y方向の最大逃げ幅

export const AlertDialog = ({ open, onClose, title, message }: DialogProps) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const currentOffset = useRef({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const btn = buttonRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const btnCx = rect.left + rect.width / 2;
    const btnCy = rect.top + rect.height / 2;

    const dx = e.clientX - btnCx;
    const dy = e.clientY - btnCy;
    const dist = Math.hypot(dx, dy);

    if (dist < FLEE_RADIUS && dist > 0) {
      // カーソルと反対方向に力を加える
      const force = ((FLEE_RADIUS - dist) / FLEE_RADIUS) * 10;
      const nx = -dx / dist;
      const ny = -dy / dist;

      const newX = Math.max(
        -MAX_OFFSET_X,
        Math.min(MAX_OFFSET_X, currentOffset.current.x + nx * force)
      );
      const newY = Math.max(
        -MAX_OFFSET_Y,
        Math.min(MAX_OFFSET_Y, currentOffset.current.y + ny * force)
      );

      currentOffset.current = { x: newX, y: newY };
      setOffset({ x: newX, y: newY });
    }
  };

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
