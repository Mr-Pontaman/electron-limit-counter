import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "@renderer/lib/utils";

type AddItemFormProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isAlarmOn: boolean;
  t: (key: string) => string;
};

export const AddItemForm = ({ value, onChange, onSubmit, isAlarmOn, t }: AddItemFormProps) => {
  return (
    <div className="grid gap-2">
      <h2 className="text-lg font-semibold">{t("counter.addItem")}</h2>
      <div className="flex gap-2">
        <div className="flex items-center relative w-full">
          <Input
            type="text"
            maxLength={20}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t("counter.addPlaceholder")}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                onSubmit();
              }
            }}
            disabled={isAlarmOn}
          />
          <X
            className={cn(
              "absolute right-2 top-1/2 transform -translate-y-1/2 hover:opacity-80 cursor-pointer",
              value.length < 5 && "hidden"
            )}
            onClick={() => onChange("")}
          />
        </div>
        <Button onClick={onSubmit} className="cursor-pointer" disabled={!value.trim() || isAlarmOn}>
          {t("counter.addButton")}
        </Button>
      </div>
    </div>
  );
};
