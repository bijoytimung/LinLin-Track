'use client';
import type { Sale, EnrichedSale, InventoryItem } from '@/lib/data';
import { RecentSales } from './_components/recent-sales';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { useMemo, useState } from 'react';
import { Heart, Star, Calendar as CalendarIcon } from 'lucide-react';
import { Overview } from './_components/overview';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const firestore = useFirestore();
  const [filter, setFilter] = useState<'today' | 'month' | 'overall' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<Date | undefined>(new Date());
  const [graphMetric, setGraphMetric] = useState<'revenue' | 'profit'>('revenue');
  
  const salesCollectionRef = useMemoFirebase(
    () => collection(firestore, 'sales_transactions'),
    [firestore]
  );
  
  const { data: sales, isLoading: salesLoading } = useCollection<Sale>(salesCollectionRef);

  const inventoryCollectionRef = useMemoFirebase(
    () => collection(firestore, 'inventory_items'),
    [firestore]
  );
  const { data: inventory, isLoading: inventoryLoading } = useCollection<InventoryItem>(inventoryCollectionRef);

  const enrichedSales = useMemo((): EnrichedSale[] => {
    if (!sales || !inventory) return [];
    const inventoryMap = new Map(inventory.map(item => [item.id, item]));
    return sales.map(sale => ({
      ...sale,
      item: inventoryMap.get(sale.inventoryItemId),
      date: (sale.transactionDate as any).toDate(),
    })).filter(sale => sale.item);
  }, [sales, inventory]);

  const displaySales = useMemo(() => {
    const now = new Date();
    switch(filter) {
        case 'today':
            return enrichedSales.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getDate() === now.getDate() &&
                       saleDate.getMonth() === now.getMonth() &&
                       saleDate.getFullYear() === now.getFullYear();
            });
        case 'month':
            return enrichedSales.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getMonth() === now.getMonth() &&
                       saleDate.getFullYear() === now.getFullYear();
            });
        case 'overall':
            return enrichedSales;
        case 'custom':
            if (customDate) {
                return enrichedSales.filter(sale => {
                    const saleDate = new Date(sale.date);
                    return saleDate.getDate() === customDate.getDate() &&
                           saleDate.getMonth() === customDate.getMonth() &&
                           saleDate.getFullYear() === customDate.getFullYear();
                });
            }
            return [];
        default:
            return [];
    }
  }, [enrichedSales, filter, customDate]);


  const displayRevenue = displaySales.reduce((acc, sale) => {
    return acc + sale.sellingPrice * sale.quantity;
  }, 0);

  const displayProfit = displaySales.reduce((acc, sale) => {
    const cost = sale.item.originalValue * sale.quantity;
    const revenue = sale.sellingPrice * sale.quantity;
    return acc + (revenue - cost);
  }, 0);
  
  const displayCapital = displayRevenue - displayProfit;

  const itemsSoldCount = displaySales.reduce((acc, sale) => acc + sale.quantity, 0);
  
  const recentSales = displaySales.sort((a,b) => b.date.getTime() - a.date.getTime());

  const overviewData = useMemo(() => {
    if (filter === 'month') {
        const dailyData: { [key: string]: { revenue: number; profit: number } } = {};
        
        displaySales.forEach(sale => {
            const day = format(new Date(sale.date), 'd');
            if (!dailyData[day]) {
                dailyData[day] = { revenue: 0, profit: 0 };
            }
            const revenue = sale.sellingPrice * sale.quantity;
            const profit = revenue - (sale.item.originalValue * sale.quantity);
            dailyData[day].revenue += revenue;
            dailyData[day].profit += profit;
        });

        // Fill in missing days
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const result = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const dayStr = String(i);
            const values = dailyData[dayStr] || { revenue: 0, profit: 0 };
            result.push({
                name: format(new Date(year, month, i), 'MMM d'),
                total: values[graphMetric]
            });
        }
        return result;

    }

    if (filter === 'today' || filter === 'custom') {
        const revenue = displaySales.reduce((acc, sale) => acc + sale.sellingPrice * sale.quantity, 0);
        const profit = displaySales.reduce((acc, sale) => acc + (sale.sellingPrice * sale.quantity - sale.item.originalValue * sale.quantity), 0);
        const dateLabel = format(customDate || new Date(), 'do MMM');
        return [{ name: dateLabel, total: graphMetric === 'revenue' ? revenue : profit }];
    }

    // Default to monthly for 'overall'
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      name: format(new Date(2000, i, 1), 'MMM'),
      revenue: 0,
      profit: 0,
    }));
    
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneYearAgo.setDate(today.getDate());

    enrichedSales.forEach(sale => {
      const saleDate = new Date(sale.date);
      if (saleDate >= oneYearAgo) {
        const monthIndex = saleDate.getMonth();
        const revenue = sale.sellingPrice * sale.quantity;
        const profit = revenue - (sale.item.originalValue * sale.quantity);
        monthlyData[monthIndex].revenue += revenue;
        monthlyData[monthIndex].profit += profit;
      }
    });

    return monthlyData.map(d => ({ name: d.name, total: d[graphMetric] }));
  }, [displaySales, enrichedSales, filter, customDate, graphMetric]);

  const getTitlePrefix = () => {
    switch (filter) {
        case 'today': return "Today's";
        case 'month': return "This Month's";
        case 'overall': return "Overall";
        case 'custom': return `${customDate ? format(customDate, 'do MMM') : 'Selected'}'s`;
        default: return '';
    }
  }
  const titlePrefix = getTitlePrefix();

  const getRecentSalesDescription = () => {
    const count = displaySales.length;
    switch (filter) {
        case 'today': return `You've made ${count} sales today.`;
        case 'month': return `You've made ${count} sales this month.`;
        case 'overall': return `You've made ${count} sales in total.`;
        case 'custom': 
            if(customDate) {
                return `You made ${count} sales on ${format(customDate, 'PPP')}.`;
            }
            return `You've made ${count} sales.`;
        default: return '';
    }
  }


  return (
    <div className="flex flex-col gap-4">
        <div className="text-center">
            <h1 className="text-4xl font-bold text-pink-500 flex items-center justify-center gap-2">
                Good Morning, <Heart className="inline text-pink-400 fill-current" /> LinLin <Star className="inline text-yellow-400 fill-current" />
            </h1>
        </div>
         <div className="flex items-center justify-between">
            <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
                <TabsList>
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="month">This Month</TabsTrigger>
                    <TabsTrigger value="overall">Overall</TabsTrigger>
                </TabsList>
            </Tabs>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            filter !== 'custom' && "text-muted-foreground",
                            filter === 'custom' && "border-primary ring-1 ring-primary"
                        )}
                    >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDate ? format(customDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={customDate}
                        onSelect={(date) => {
                            setCustomDate(date);
                            setFilter('custom');
                        }}
                        disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {titlePrefix} Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{displayRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {titlePrefix} Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{displayProfit.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {titlePrefix} Capital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{displayCapital.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{itemsSoldCount}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <Tabs value={graphMetric} onValueChange={(value) => setGraphMetric(value as 'revenue' | 'profit')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="revenue">Total Sales</TabsTrigger>
                <TabsTrigger value="profit">Profit</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={overviewData} metric={graphMetric} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{titlePrefix} Sales</CardTitle>
            <CardDescription>
              {getRecentSalesDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales sales={recentSales} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
