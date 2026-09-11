import { useEffect, useState } from "react";
import type { DailyHistory } from "../../../shared/types";
import { shiftMonth, toCurrentMonth, toLatestMonth, type YearMonth } from "../lib/history";

export const useHistoryMonth = (history: DailyHistory) => {
  const [currentMonth, setCurrentMonth] = useState<YearMonth>(() => toCurrentMonth());

  useEffect(() => {
    setCurrentMonth(toLatestMonth(history));
  }, [history]);

  const goToPrevMonth = () => {
    setCurrentMonth((prev) => shiftMonth(prev.year, prev.month, -1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => shiftMonth(prev.year, prev.month, 1));
  };

  const jumpToCurrent = () => {
    setCurrentMonth(toCurrentMonth());
  };

  return { currentMonth, goToPrevMonth, goToNextMonth, jumpToCurrent };
};
