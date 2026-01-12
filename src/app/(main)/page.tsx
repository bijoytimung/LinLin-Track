import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getSales } from '@/lib/data';
import { DollarSign, Package, TrendingUp } from 'lucide-react';
import { Overview } from './_components/overview';
import { RecentSales } from './_components/recent-sales';

export default async function DashboardPage() {
  const sales = await getSales();

  const totalRevenue = sales.reduce((acc, sale) => {
    return acc + sale.sellingPrice * sale.quantity;
  }, 0);

  const totalProfit = sales.reduce((acc, sale) => {
    const cost = sale.item.originalValue * sale.quantity;
    const revenue = sale.sellingPrice * sale.quantity;
    return acc + (revenue - cost);
  }, 0);

  const itemsSoldCount = sales.reduce((acc, sale) => acc + sale.quantity, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString('en-US')}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on all sales recorded
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalProfit.toLocaleString('en-US')}
            </div>
            <p className="text-xs text-muted-foreground">
              After cost of goods
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{itemsSoldCount.toLocaleString('en-US')}
            </div>
            <p className="text-xs text-muted-foreground">
              Total items sold across all transactions
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Monthly revenue from sales.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={sales} />
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>You made {sales.slice(0, 5).length} sales recently.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales sales={sales.slice(0,5)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
