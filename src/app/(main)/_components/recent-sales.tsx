import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { EnrichedSale } from '@/lib/data';

interface RecentSalesProps {
    sales: EnrichedSale[];
}

export function RecentSales({ sales }: RecentSalesProps) {
  return (
    <div className="space-y-8">
      {sales.map(sale => (
        <div className="flex items-center" key={sale.id}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={sale.item.imageUrl} alt={sale.item.name} data-ai-hint={sale.item.imageHint} />
            <AvatarFallback>{sale.item.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.item.name}</p>
            <p className="text-sm text-muted-foreground">{sale.date.toLocaleDateString()}</p>
          </div>
          <div className="ml-auto font-medium">
            +${(sale.sellingPrice * sale.quantity).toLocaleString('en-US')}
          </div>
        </div>
      ))}
    </div>
  );
}
