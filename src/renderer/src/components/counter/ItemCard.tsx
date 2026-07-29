import { useTranslation } from "react-i18next";
import { Minus, Plus, Settings, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Item } from "../../../../shared/types";

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
    <Card>
      <CardContent className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-3xl font-semibold tracking-tight">{item.name}</h3>
          <div className="flex items-center gap-2 pl-2">
            <span className="text-3xl font-bold">{item.count}</span>
            <span className="text-2xl text-muted-foreground">/ {item.limit}</span>
            {isExceeded && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded-md animate-pulse">
                {t("itemCard.limitExceeded")}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => onDecrement(item.name)}
            variant="default"
            className="cursor-pointer size-20 hover:opacity-90 flex items-center justify-center"
            disabled={item.count <= 0 || isAlarmOn}
          >
            <Minus className="size-10" />
          </Button>
          <Button
            onClick={() => onIncrement(item.name)}
            variant="default"
            className="cursor-pointer size-20 hover:opacity-90 flex items-center justify-center"
            disabled={isAlarmOn}
          >
            <Plus className="size-10" />
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isAlarmOn}>
            <Button variant="default" size="icon-lg" className="cursor-pointer">
              <Settings className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-max p-3" align="end">
            <div className="flex justify-between items-center gap-4">
              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium whitespace-nowrap">
                  {t("itemCard.dailyLimit")}
                </label>
                <Input
                  type="number"
                  value={item.limit}
                  onChange={(e) => onSetLimit(item.name, Number(e.target.value))}
                  className="w-20 h-8"
                  min="0"
                />
              </div>
              <Button
                onClick={() => onDelete(item.name)}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50/50 p-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};
