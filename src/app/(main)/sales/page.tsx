import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getInventoryItems, getSales } from '@/lib/data';
import { AddSaleDialog } from './_components/add-sale-dialog';

export default async function SalesPage() {
  const sales = await getSales();
  const inventory = await getInventoryItems();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">
            View and manage all your recorded sales.
          </p>
        </div>
        <AddSaleDialog inventory={inventory} />
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Original Price</TableHead>
              <TableHead className="text-right">Selling Price</TableHead>
              <TableHead className="text-right">Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => {
              const profit =
                sale.sellingPrice * sale.quantity -
                sale.item.originalValue * sale.quantity;
              return (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div className="font-medium">{sale.item.name}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {sale.date.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">{sale.quantity}</TableCell>
                  <TableCell className="text-right hidden sm:table-cell">
                    ${sale.item.originalValue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${sale.sellingPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={profit >= 0 ? 'default' : 'destructive'} className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
                      ${profit.toFixed(2)}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
