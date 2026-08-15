import type { Product } from "../types/store.ts";

export const newArrivals: Product[] = [
  { id: "one-life", name: "One Life Graphic T-shirt", image: "/assets/new-arrivals-1.png", price: 220, previousPrice: 260, discount: 40, rating: 4, href: "/products" },
  { id: "skinny-jeans", name: "Skinny Fit Jeans", image: "/assets/new-arrivals-2.png", price: 240, previousPrice: 260, discount: 20, rating: 3.5, href: "/products" },
  { id: "checkered-shirt", name: "Checkered Shirt", image: "/assets/new-arrivals-3.png", price: 180, rating: 4.5, href: "/products" },
  { id: "sleeve-stripe", name: "Sleeve Striped T-shirt", image: "/assets/new-arrivals-4.png", price: 130, previousPrice: 160, discount: 20, rating: 4.5, href: "/products" },
];

export const topSelling: Product[] = [
  { id: "vertical-stripe", name: "Vertical Striped Shirt", image: "/assets/top-selling-1.png", price: 212, previousPrice: 232, discount: 20, rating: 5, href: "/products" },
  { id: "courage", name: "Courage Graphic T-shirt", image: "/assets/top-selling-2.png", price: 240, rating: 4, href: "/products" },
  { id: "bermuda", name: "Loose Fit Bermuda Shorts", image: "/assets/top-selling-3.png", price: 80, rating: 3, href: "/products" },
  { id: "faded-jeans", name: "Faded Skinny Jeans", image: "/assets/top-selling-4.png", price: 210, rating: 4.5, href: "/products" },
];

export const recommendations: Product[] = [
  { id: "contrast-polo", name: "Polo with Contrast Trims", image: "/assets/you-might-also-like-1.png", price: 212, previousPrice: 242, discount: 20, rating: 4, href: "/products" },
  { id: "gradient-graphic", name: "Gradient Graphic T-shirt", image: "/assets/you-might-also-like-2.png", price: 145, rating: 3.5, href: "/products" },
  { id: "tipping-polo", name: "Polo with Tipping Details", image: "/assets/you-might-also-like-3.png", price: 180, rating: 4.5, href: "/products" },
  { id: "black-stripe", name: "Black Striped T-shirt", image: "/assets/you-might-also-like-4.png", price: 120, previousPrice: 150, discount: 30, rating: 5, href: "/products" },
];

export const allProducts = [...newArrivals, ...topSelling, ...recommendations];

export const categoryProducts = [
  recommendations[1], recommendations[2], recommendations[3],
  newArrivals[1], newArrivals[2], newArrivals[3],
  topSelling[0], topSelling[1], topSelling[2],
];
