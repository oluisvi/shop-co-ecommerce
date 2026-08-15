import type { Review } from "../types/store.ts";

export const homeReviews: Review[] = [
  { id: "john", author: "John R.", rating: 5, quote: "Choosing outfits that match my style was difficult until I found SHOP.CO. The range makes dressing for different moments feel effortless." },
  { id: "sarah", author: "Sarah M.", rating: 5, quote: "I’m impressed by the quality and style of the clothes. From casual pieces to sharper looks, every item feels considered." },
  { id: "alex", author: "Alex K.", rating: 4.5, quote: "Finding clothes that align with my taste is finally simple. The selection feels current without losing its personality." },
];

export const productReviews: Review[] = [
  { id: "samantha", author: "Samantha L.", rating: 4.5, quote: "The fit is flattering and the graphic has exactly the right amount of attitude. It has quickly become part of my weekly rotation.", date: "August 14, 2023" },
  { id: "alex-product", author: "Alex M.", rating: 4, quote: "The fabric feels soft and the cut sits well through the shoulders. A strong everyday T-shirt with a distinctive print.", date: "August 15, 2023" },
  { id: "james", author: "James L.", rating: 4.5, quote: "The design stands out without feeling loud. It works just as well layered under a jacket as it does on its own.", date: "August 16, 2023" },
  { id: "liam", author: "Liam K.", rating: 4, quote: "Comfortable, creative, and easy to style. The details make it feel more considered than a basic graphic tee.", date: "August 18, 2023" },
];
