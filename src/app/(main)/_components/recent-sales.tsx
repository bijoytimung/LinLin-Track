import type { EnrichedSale } from '@/lib/data';

interface RecentSalesProps {
    sales: EnrichedSale[];
}

export function RecentSales({ sales }: RecentSalesProps) {
  return (
    <div className="space-y-2">
      {sales.map(sale => (
        <div className="flex items-center justify-between border-b-2 border-dashed border-pink-200 dark:border-pink-800 py-2" key={sale.id}>
          <p className="text-lg font-bold">{sale.item.name}</p>
          <div className="font-bold text-lg">
            - ${(sale.sellingPrice * sale.quantity).toLocaleString('en-US', {minimumFractionDigits: 2})}
          </div>
        </div>
      ))}
    </div>
  );
}
