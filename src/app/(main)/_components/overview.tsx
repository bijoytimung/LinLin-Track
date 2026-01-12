"use client";

import type { Sale } from '@/lib/data';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';

interface OverviewProps {
  data: Sale[];
}

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
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={monthlyRevenue}>
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
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
