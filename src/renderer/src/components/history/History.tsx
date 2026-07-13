import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, ChevronsRight, Trash2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../ui/chart";
import { Button } from "../ui/button";
import { ConfirmDialog } from "../ConfirmDialog";
import type { DailyHistory } from "@renderer/types";
import { toast } from "sonner";
import { NoHistory } from "./NoHistory";

const formatDate = (dateStr: string): string => {
  const parts = dateStr.split("-");
  return `${parseInt(parts[1])}/${parseInt(parts[2])}`;
};

const History = () => {
  const { t, i18n } = useTranslation();
  const [history, setHistory] = useState<DailyHistory>({});
  const [loading, setLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState({ year: 2026, month: 6 });

  const chartConfig = {
    count: { label: t("history.count") }
  } satisfies ChartConfig;

  useEffect(() => {
    void window.api.getHistory().then((h) => {
      const hist = h as DailyHistory;
      setHistory(hist);

      // 最新のデータがある月に初期設定
      const dates = Object.keys(hist).sort();
      if (dates.length > 0) {
        const latest = dates[dates.length - 1];
        const [y, m] = latest.split("-").map(Number);
        setCurrentMonth({ year: y, month: m });
      } else {
        const now = new Date();
        setCurrentMonth({ year: now.getFullYear(), month: now.getMonth() + 1 });
      }

      setLoading(false);
    });
  }, []);

  const goToPrevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 1) return { year: prev.year - 1, month: 12 };
      return { ...prev, month: prev.month - 1 };
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 12) return { year: prev.year + 1, month: 1 };
      return { ...prev, month: prev.month + 1 };
    });
  };

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

  // 現在の月の全日付を生成
  const { year, month } = currentMonth;
  const daysInMonth = new Date(year, month, 0).getDate();

  const monthDates: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    monthDates.push(`${year}-${mm}-${dd}`);
  }

  // 全履歴に存在するアイテム名を収集
  const itemNames = [
    ...new Set(Object.values(history).flatMap((entries) => entries.map((e) => e.name)))
  ];

  // 当月が現在の月かどうか（未来月への移動を防ぐ／現在月に戻るボタン用）
  const now = new Date();
  const canGoNext =
    year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  // 月表示のローカライズ
  const monthLabel = new Intl.DateTimeFormat(i18n.language, {
    year: "numeric",
    month: "long"
  }).format(new Date(year, month - 1));

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
      {itemNames.map((name) => {
        // このアイテムの最新の制限値を取得（ReferenceLine用）
        const relevantEntries = allDates
          .map((d) => history[d]?.find((e) => e.name === name))
          .filter(Boolean);
        const latestLimit = relevantEntries.at(-1)?.limit ?? 0;

        // 各日付のデータを生成（履歴が無い日は count=0, limit=0）
        const chartData = monthDates.map((date) => {
          const entry = history[date]?.find((e) => e.name === name);
          const count = entry?.count ?? 0;
          const limit = entry?.limit ?? 0;
          return {
            date: formatDate(date),
            count,
            limit,
            exceeded: limit > 0 && count > limit
          };
        });

        return (
          <Card key={name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl">{name}</CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={goToPrevMonth}
                  title={t("history.prevMonth")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[120px] text-center select-none">
                  {monthLabel}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={goToNextMonth}
                  disabled={!canGoNext}
                  title={t("history.nextMonth")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                {!isCurrentMonth && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setCurrentMonth({ year: now.getFullYear(), month: now.getMonth() + 1 })
                    }
                    title={t("history.jumpToCurrent")}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-48 w-full">
                <BarChart data={chartData} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    interval={1}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, _key, item) => (
                          <span>
                            {value} / {item.payload.limit}
                          </span>
                        )}
                      />
                    }
                  />
                  {latestLimit > 0 && (
                    <ReferenceLine
                      y={latestLimit}
                      stroke="var(--chart-5)"
                      strokeDasharray="5 3"
                      strokeWidth={1.5}
                      label={{
                        value: t("history.limit", { value: latestLimit }),
                        position: "insideTopRight",
                        fontSize: 11,
                        fill: "var(--chart-5)"
                      }}
                    />
                  )}
                  <Bar
                    dataKey="count"
                    radius={4}
                    maxBarSize={40}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    shape={(props: any) => (
                      <rect
                        x={props.x}
                        y={props.y}
                        width={props.width}
                        height={props.height}
                        rx={4}
                        fill={props.exceeded ? "var(--chart-5)" : "var(--chart-2)"}
                      />
                    )}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default History;
