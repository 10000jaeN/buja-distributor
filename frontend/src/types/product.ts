export interface Category {
  parent: string;
  children: string[];
  order?: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  stats: {
    orderCount: number;
    ratingAverage: number;
    reviewCount: number;
  };
  content?: string;
  contentBlock: {
    type: "text" | "image";
    value: string;
  }[];
  price: number;
  shippingFee: number;
  freeShippingThreshold: number;
  bundleShipping: boolean;
  category: {
    parent: string;
    child: string;
    path: string[];
  };
  thumbnail: string[];
  stock: number | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}
