export type InventoryItem = {
  id: string;
  name: string;
  originalValue: number;
  quantity: number;
  category: string;
  imageUrl: string;
  imageHint: string;
  createdAt: Date;
};

export type Category = {
    id: string;
    name: string;
};

export type Sale = {
  id: string;
  inventoryItemId: string;
  quantity: number;
  sellingPrice: number;
  transactionDate: Date;
};

export type EnrichedSale = Omit<Sale, 'inventoryItemId' | 'transactionDate'> & {
  item: InventoryItem;
  date: Date;
}
