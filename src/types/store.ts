export type ProductCategory = "T-shirts" | "Shirts" | "Jeans" | "Shorts" | "Polos";
export type ProductCollection = "New arrivals" | "Top selling" | "Recommended";

export type ProductColor = {
  name: string;
  value: string;
};

export type ProductImage = {
  src: string;
  alt: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  previousPrice?: number;
  discount?: number;
  rating: number;
  category: ProductCategory;
  collection: ProductCollection;
  href: `/products/${string}`;
  description?: string;
  gallery?: ProductImage[];
  colors?: ProductColor[];
  sizes?: string[];
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  quote: string;
  date?: string;
};
