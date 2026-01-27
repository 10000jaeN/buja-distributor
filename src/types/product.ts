export interface Product {
  _id: string;
  name: string;
  slug: string;
  stats: {
    orderCount: number;
    ratingAverage: number;
    reviewCount: number;
  };
  contentBlock: [
    {
      type: "text" | "image";
      value: string;
    },
  ];
  price: number;
  category: {
    parent: string;
    child: string;
    path: string[];
  };
  thumbnail: string[];
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}
