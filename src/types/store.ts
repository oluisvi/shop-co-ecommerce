export type Product = {
  id: string;
  name: string;
  image: string;
  price: number;
  previousPrice?: number;
  discount?: number;
  rating: number;
  href: "/products";
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  quote: string;
  date?: string;
};
