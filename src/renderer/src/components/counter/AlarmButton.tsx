import { Music } from "lucide-react";

type AlarmButtonProps = {
  isVisible: boolean;
  onClick: () => void;
};

export const AlarmButton = ({ isVisible, onClick }: AlarmButtonProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <button className="cursor-pointer" onClick={onClick}>
      <Music size={30} className="animate-pulse" />
    </button>
  );
};
