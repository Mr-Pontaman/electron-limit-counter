import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "../ui/chart";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "../ConfirmDialog";
import type { DailyHistory } from "@renderer/types";
import { toast } from "sonner";
import { NoHistory } from "./NoHistory";

const formatDate = (dateStr: string): string => {
  const parts = dateStr.split("-");
  return `${parseInt(parts[1])}/${parseInt(parts[2])}`;
};

const History = () => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<DailyHistory>({});
  const [loading, setLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const chartConfig = {
    count: { label: t("history.count") }
  } satisfies ChartConfig;

  useEffect(() => {
    void window.api.getHistory().then((h) => {
      setHistory(h as DailyHistory);
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

  const allDates = Object.keys(history).sort().slice(-14);

  if (allDates.length === 0) {
    return <NoHistory />;
  }

  const itemNames = [
    ...new Set(Object.values(history).flatMap((entries) => entries.map((e) => e.name)))
  ];

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
          {t("history.deleteHistory")}
        </Button>
      </div>
      {itemNames.map((name) => {
        const chartData = allDates.map((date) => {
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

        const latestLimit =
          allDates
            .map((d) => history[d]?.find((e) => e.name === name))
            .filter(Boolean)
            .at(-1)?.limit ?? 0;

        return (
          <Card key={name}>
            <CardHeader>
              <CardTitle className="text-xl">{name}</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-48 w-full">
                <BarChart data={chartData} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
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
