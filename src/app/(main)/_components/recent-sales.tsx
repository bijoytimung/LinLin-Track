import type { EnrichedSale } from '@/lib/data';
import Image from 'next/image';

interface RecentSalesProps {
    sales: EnrichedSale[];
}

export function RecentSales({ sales }: RecentSalesProps) {
  if (sales.length === 0) {
    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No sales recorded today.</p>
        </div>
    )
  }
  return (
    <div className="space-y-4">
      {sales.map((sale) => (
        <div className="flex items-center" key={sale.id}>
            <div className="relative h-10 w-10 overflow-hidden rounded-full">
                <Image 
                    src={sale.item.imageUrl} 
                    alt={sale.item.name} 
                    fill
                    className="object-cover"
                    data-ai-hint={sale.item.imageHint}
                />
            </div>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.item.name}</p>
            <p className="text-sm text-muted-foreground">
                Sold for ₹{sale.sellingPrice.toFixed(2)}
            </p>
          </div>
          <div className="ml-auto font-medium">+₹{(sale.sellingPrice - sale.item.originalValue).toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}
