import { useRef, useState } from "react";

const FLEE_RADIUS = 100; // この距離以内でボタンが逃げ始める (px)
const MAX_OFFSET_X = 100; // X方向の最大逃げ幅
const MAX_OFFSET_Y = 45; // Y方向の最大逃げ幅
const FLEE_FORCE = 10;

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const useFleeButton = () => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const currentOffset = useRef({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (event: React.MouseEvent): void => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const buttonCenterX = rect.left + rect.width / 2;
    const buttonCenterY = rect.top + rect.height / 2;

    const dx = event.clientX - buttonCenterX;
    const dy = event.clientY - buttonCenterY;
    const distance = Math.hypot(dx, dy);

    if (distance >= FLEE_RADIUS || distance === 0) return;

    // カーソルと反対方向に力を加える
    const force = ((FLEE_RADIUS - distance) / FLEE_RADIUS) * FLEE_FORCE;
    const nextX = clamp(
      currentOffset.current.x + (-dx / distance) * force,
      -MAX_OFFSET_X,
      MAX_OFFSET_X
    );
    const nextY = clamp(
      currentOffset.current.y + (-dy / distance) * force,
      -MAX_OFFSET_Y,
      MAX_OFFSET_Y
    );

    currentOffset.current = { x: nextX, y: nextY };
    setOffset({ x: nextX, y: nextY });
  };

  return { offset, buttonRef, handleMouseMove };
};
