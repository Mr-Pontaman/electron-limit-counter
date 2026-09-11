import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../ui/chart";
import { Button } from "../ui/button";
import type { ChartDatum } from "../../lib/history";

type ItemHistoryChartProps = {
  name: string;
  data: ChartDatum[];
  latestLimit: number;
  monthLabel: string;
  canGoNext: boolean;
  isCurrentMonth: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onJumpToCurrent: () => void;
};

export const ItemHistoryChart = ({
  name,
  data,
  latestLimit,
  monthLabel,
  canGoNext,
  isCurrentMonth,
  onPrevMonth,
  onNextMonth,
  onJumpToCurrent
}: ItemHistoryChartProps) => {
  const { t } = useTranslation();

  const chartConfig = {
    count: { label: t("history.count") }
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl">{name}</CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onPrevMonth}
            title={t("history.prevMonth")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-30 text-center select-none">{monthLabel}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onNextMonth}
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
              onClick={onJumpToCurrent}
              title={t("history.jumpToCurrent")}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-48 w-full">
          <BarChart data={data} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
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
            <Bar dataKey="count" radius={4} maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.exceeded ? "var(--chart-5)" : "var(--chart-2)"} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
