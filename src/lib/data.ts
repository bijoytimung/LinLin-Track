import { PlaceHolderImages } from './placeholder-images';

export type InventoryItem = {
  id: string;
  name: string;
  originalValue: number;
  quantity: number;
  imageUrl: string;
  imageHint: string;
  createdAt: Date;
};

export type Sale = {
  id: string;
  item: InventoryItem;
  quantity: number;
  sellingPrice: number;
  date: Date;
};

const placeholderImageMap = new Map(PlaceHolderImages.map(p => [p.id, p]));

const inventoryItems: InventoryItem[] = [
  {
    id: 'item-1',
    name: 'Blue T-Shirt',
    originalValue: 15,
    quantity: 50,
    imageUrl: placeholderImageMap.get('item-1')?.imageUrl || '',
    imageHint: placeholderImageMap.get('item-1')?.imageHint || '',
    createdAt: new Date('2023-01-10'),
  },
  {
    id: 'item-2',
    name: 'Black Jeans',
    originalValue: 45,
    quantity: 30,
    imageUrl: placeholderImageMap.get('item-2')?.imageUrl || '',
    imageHint: placeholderImageMap.get('item-2')?.imageHint || '',
    createdAt: new Date('2023-01-12'),
  },
  {
    id: 'item-3',
    name: 'Gray Hoodie',
    originalValue: 55,
    quantity: 25,
    imageUrl: placeholderImageMap.get('item-3')?.imageUrl || '',
    imageHint: placeholderImageMap.get('item-3')?.imageHint || '',
    createdAt: new Date('2023-02-05'),
  },
  {
    id: 'item-4',
    name: 'White Sneakers',
    originalValue: 70,
    quantity: 40,
    imageUrl: placeholderImageMap.get('item-4')?.imageUrl || '',
    imageHint: placeholderImageMap.get('item-4')?.imageHint || '',
    createdAt: new Date('2023-02-20'),
  },
  {
    id: 'item-5',
    name: 'Leather Backpack',
    originalValue: 120,
    quantity: 15,
    imageUrl: placeholderImageMap.get('item-5')?.imageUrl || '',
    imageHint: placeholderImageMap.get('item-5')?.imageHint || '',
    createdAt: new Date('2023-03-01'),
  },
];

const sales: Sale[] = [
  {
    id: 'sale-1',
    item: inventoryItems[0],
    quantity: 2,
    sellingPrice: 20,
    date: new Date('2023-05-01'),
  },
  {
    id: 'sale-2',
    item: inventoryItems[2],
    quantity: 1,
    sellingPrice: 60,
    date: new Date('2023-05-02'),
  },
  {
    id: 'sale-3',
    item: inventoryItems[1],
    quantity: 1,
    sellingPrice: 50,
    date: new Date('2023-05-02'),
  },
  {
    id: 'sale-4',
    item: inventoryItems[3],
    quantity: 1,
    sellingPrice: 75,
    date: new Date('2023-05-03'),
  },
  {
    id: 'sale-5',
    item: inventoryItems[0],
    quantity: 5,
    sellingPrice: 18,
    date: new Date('2023-05-04'),
  },
  {
    id: 'sale-6',
    item: inventoryItems[4],
    quantity: 1,
    sellingPrice: 125,
    date: new Date('2023-05-05'),
  },
];

// Add more sales data for the last year
const today = new Date();
for (let i = 7; i <= 365; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - (i % 30));
    const itemIndex = Math.floor(Math.random() * inventoryItems.length);
    const item = inventoryItems[itemIndex];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const sellingPrice = item.originalValue + Math.floor(Math.random() * 20) - 5;
    sales.push({
        id: `sale-${i}`,
        item: item,
        quantity: quantity,
        sellingPrice: sellingPrice,
        date: date,
    });
}


export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  return Promise.resolve(inventoryItems);
};

export const getSales = async (): Promise<Sale[]> => {
  return Promise.resolve(sales);
};
