"use client";

import type { Sale } from '@/lib/data';
import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartTooltipContent, ChartContainer, type ChartConfig } from '@/components/ui/chart';

interface OverviewProps {
  data: Sale[];
}

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function Overview({ data }: OverviewProps) {
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
        const month = new Date(0, i).toLocaleString('default', { month: 'short' });
        return { name: month, total: 0 };
    });

    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

    data.forEach(sale => {
        if (sale.date >= oneYearAgo) {
            const monthIndex = sale.date.getMonth();
            monthlyRevenue[monthIndex].total += sale.sellingPrice * sale.quantity;
        }
    });

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={monthlyRevenue}>
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
          tickFormatter={(value) => `$${value}`}
        />
         <Tooltip 
          cursor={false}
          content={<ChartTooltipContent 
            formatter={(value, name) => [`$${(value as number).toFixed(2)}`, `Revenue for ${name}`]}
            labelClassName="font-bold"
          />}
        />
        <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
