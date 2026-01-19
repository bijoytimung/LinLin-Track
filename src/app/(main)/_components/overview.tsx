"use client";

import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartTooltipContent, ChartContainer, type ChartConfig } from '@/components/ui/chart';

interface OverviewProps {
  data: {name: string, total: number}[];
  metric: 'revenue' | 'profit';
}

export function Overview({ data, metric }: OverviewProps) {
    const chartConfig = {
        total: {
            label: metric === 'revenue' ? "Revenue" : "Profit",
            color: metric === 'revenue' ? "hsl(var(--primary))" : "hsl(var(--chart-2))",
        },
    } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={data}>
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value}`}
        />
         <Tooltip 
          cursor={false}
          content={<ChartTooltipContent 
            formatter={(value, name, item) => {
              const label = metric === 'revenue' ? 'Total Sales' : 'Profit';
              return [`₹${(value as number).toFixed(2)}`, `${label} for ${item.payload.name}`];
            }}
            labelClassName="font-bold"
          />}
        />
        <Bar key={metric} dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
