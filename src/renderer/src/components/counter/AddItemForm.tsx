import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type AddItemFormProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isAlarmOn: boolean;
};

export const AddItemForm = ({ value, onChange, onSubmit, isAlarmOn }: AddItemFormProps) => {
  const { t } = useTranslation();
  return (
    <div className="grid gap-2">
      <h2 className="text-lg font-semibold">{t("counter.addItem")}</h2>
      <div className="flex gap-2">
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
        <Button onClick={onSubmit} className="cursor-pointer" disabled={!value.trim() || isAlarmOn}>
          {t("counter.addButton")}
        </Button>
      </div>
    </div>
  );
};
