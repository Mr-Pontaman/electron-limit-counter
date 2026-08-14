import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { ConfirmDialog } from "../ConfirmDialog";
import { toast } from "sonner";
import { NoHistory } from "./NoHistory";
import { ItemHistoryChart } from "./ItemHistoryChart";
import { useHistoryMonth } from "../../hooks/useHistoryMonth";
import {
  buildChartData,
  buildMonthDates,
  canGoNextMonth,
  collectItemNames,
  formatMonthLabel,
  getLatestLimit,
  isCurrentMonth
} from "../../lib/history";
import type { DailyHistory } from "../../../../shared/types";

const History = () => {
  const { t, i18n } = useTranslation();
  const [history, setHistory] = useState<DailyHistory>({});
  const [loading, setLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { currentMonth, goToPrevMonth, goToNextMonth, jumpToCurrent } = useHistoryMonth(history);

  useEffect(() => {
    void window.api.getHistory().then((hist) => {
      setHistory(hist);
      setLoading(false);
    });
  }, []);

  const handleDeleteHistory = async () => {
    setDeleteConfirmOpen(false);
    try {
      await window.api.deleteHistory();
      setHistory({});
    } catch (error) {
      console.error("Failed to delete history:", error);
      toast.error(t("history.deleteFailed"));
    }
  };

  if (loading) {
    return <div className="p-4">{t("history.loading")}</div>;
  }

  const allDates = Object.keys(history).sort();

  if (allDates.length === 0) {
    return <NoHistory />;
  }

  const { year, month } = currentMonth;
  const monthDates = buildMonthDates(year, month);
  const itemNames = collectItemNames(history);
  const monthLabel = formatMonthLabel(year, month, i18n.language);

  return (
    <div className="grid gap-6">
      <ConfirmDialog
        open={deleteConfirmOpen}
        message={t("history.deleteHistoryConfirm")}
        onConfirm={handleDeleteHistory}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="text-red-500 hover:text-red-700 border-red-300"
          onClick={() => setDeleteConfirmOpen(true)}
        >
          <Trash2 className="w-4 h-4 mr-1" />
        </Button>
      </div>
      {itemNames.map((name) => (
        <ItemHistoryChart
          key={name}
          name={name}
          data={buildChartData(history, name, monthDates)}
          latestLimit={getLatestLimit(history, name, allDates)}
          monthLabel={monthLabel}
          canGoNext={canGoNextMonth(year, month)}
          isCurrentMonth={isCurrentMonth(year, month)}
          onPrevMonth={goToPrevMonth}
          onNextMonth={goToNextMonth}
          onJumpToCurrent={jumpToCurrent}
        />
      ))}
    </div>
  );
};

export default History;
