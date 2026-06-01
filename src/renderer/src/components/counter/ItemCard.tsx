import { Minus, Plus, Settings, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Item } from "@renderer/types";

type ItemCardProps = {
  item: Item;
  onIncrement: (itemName: string) => void;
  onDecrement: (itemName: string) => void;
  onSetLimit: (itemName: string, newLimit: number) => void;
  onDelete: (itemName: string) => void;
  isAlarmOn: boolean;
};

export const ItemCard = ({
  item,
  onIncrement,
  onDecrement,
  onSetLimit,
  onDelete,
  isAlarmOn
}: ItemCardProps) => {
  const { t } = useTranslation();
  const isExceeded = item.count > item.limit;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-semibold">{item.name}</h3>
          </div>
          <div className="flex items-center gap-2 pt-3 pl-5">
            <span className="text-3xl font-bold">{item.count}</span>
            <span className="text-2xl text-muted-foreground">/ {item.limit}</span>
            {isExceeded && (
              <div>
                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded">
                  {t("itemCard.limitExceeded")}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <Button
            onClick={() => onDecrement(item.name)}
            variant={"default"}
            className="cursor-pointer size-20 hover:opacity-80"
            disabled={item.count <= 0 || isAlarmOn}
          >
            <Minus className="size-14" />
          </Button>
          <Button
            onClick={() => onIncrement(item.name)}
            variant={"default"}
            className="cursor-pointer size-20 hover:opacity-80"
            disabled={isAlarmOn}
          >
            <Plus className="size-14" />
          </Button>
        </div>
      </div>

      <div className="grid place-self-end pt-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="cursor-pointer" disabled={isAlarmOn}>
            <Button variant={"default"} size={"icon-lg"}>
              <Settings />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-max p-2">
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <label className="text-sm">{t("itemCard.dailyLimit")}</label>
                <Input
                  type="number"
                  value={item.limit}
                  onChange={(e) => onSetLimit(item.name, Number(e.target.value))}
                  className="w-20"
                  min="0"
                />
              </div>
              <Button
                onClick={() => onDelete(item.name)}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
