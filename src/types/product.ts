export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrls?: string[];
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}
