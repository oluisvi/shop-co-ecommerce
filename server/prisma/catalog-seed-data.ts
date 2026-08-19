export type SeedProduct = {
  id: string;
  slug: string;
  name: string;
  cardImage: string;
  price: number;
  previousPrice?: number;
  rating: number;
  category: "T-shirts" | "Shirts" | "Jeans" | "Shorts" | "Polos";
  collection: "New arrivals" | "Top selling" | "Recommended";
  description?: string;
  gallery?: { url: string; alt: string }[];
  colors?: { name: string; value: string }[];
  sizes?: string[];
};

export const seedProducts: SeedProduct[] = [
  {
    id: "one-life",
    slug: "one-life",
    name: "One Life Graphic T-shirt",
    cardImage: "/assets/new-arrivals-1.png",
    price: 220,
    previousPrice: 260,
    rating: 4,
    category: "T-shirts",
    collection: "New arrivals",
    description: "A graphic T-shirt made for everyday expression. Its soft, breathable feel balances a bold print with an easy silhouette.",
    gallery: [
      { url: "/assets/one-life-shirt-front.png", alt: "Front view of One Life Graphic T-shirt" },
      { url: "/assets/one-life-shirt-back.png", alt: "Back view of One Life Graphic T-shirt" },
      { url: "/assets/one-life-shirt-model.png", alt: "Model wearing One Life Graphic T-shirt" },
    ],
    colors: [
      { name: "Olive", value: "#4f4631" },
      { name: "Forest", value: "#263d31" },
      { name: "Navy", value: "#30354c" },
    ],
    sizes: ["Small", "Medium", "Large", "X-Large"],
  },
  { id: "skinny-jeans", slug: "skinny-jeans", name: "Skinny Fit Jeans", cardImage: "/assets/new-arrivals-2.png", price: 240, previousPrice: 260, rating: 3.5, category: "Jeans", collection: "New arrivals" },
  { id: "checkered-shirt", slug: "checkered-shirt", name: "Checkered Shirt", cardImage: "/assets/new-arrivals-3.png", price: 180, rating: 4.5, category: "Shirts", collection: "New arrivals" },
  { id: "sleeve-stripe", slug: "sleeve-stripe", name: "Sleeve Striped T-shirt", cardImage: "/assets/new-arrivals-4.png", price: 130, previousPrice: 160, rating: 4.5, category: "T-shirts", collection: "New arrivals" },
  { id: "vertical-stripe", slug: "vertical-stripe", name: "Vertical Striped Shirt", cardImage: "/assets/top-selling-1.png", price: 212, previousPrice: 232, rating: 5, category: "Shirts", collection: "Top selling" },
  { id: "courage", slug: "courage", name: "Courage Graphic T-shirt", cardImage: "/assets/top-selling-2.png", price: 240, rating: 4, category: "T-shirts", collection: "Top selling" },
  { id: "bermuda", slug: "bermuda", name: "Loose Fit Bermuda Shorts", cardImage: "/assets/top-selling-3.png", price: 80, rating: 3, category: "Shorts", collection: "Top selling" },
  { id: "faded-jeans", slug: "faded-jeans", name: "Faded Skinny Jeans", cardImage: "/assets/top-selling-4.png", price: 210, rating: 4.5, category: "Jeans", collection: "Top selling" },
  { id: "contrast-polo", slug: "contrast-polo", name: "Polo with Contrast Trims", cardImage: "/assets/you-might-also-like-1.png", price: 212, previousPrice: 242, rating: 4, category: "Polos", collection: "Recommended" },
  { id: "gradient-graphic", slug: "gradient-graphic", name: "Gradient Graphic T-shirt", cardImage: "/assets/you-might-also-like-2.png", price: 145, rating: 3.5, category: "T-shirts", collection: "Recommended" },
  { id: "tipping-polo", slug: "tipping-polo", name: "Polo with Tipping Details", cardImage: "/assets/you-might-also-like-3.png", price: 180, rating: 4.5, category: "Polos", collection: "Recommended" },
  { id: "black-stripe", slug: "black-stripe", name: "Black Striped T-shirt", cardImage: "/assets/you-might-also-like-4.png", price: 120, previousPrice: 150, rating: 5, category: "T-shirts", collection: "Recommended" },
];

