import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const categories = await this.prisma.category.findMany({
      include: {
        products: {
          where: { status: "ACTIVE" },
          select: { variants: { where: { active: true }, select: { price: true, active: true } } },
        },
      },
    });
    const prices = categories.flatMap((category) =>
      category.products.flatMap((product) => product.variants.map((variant) => Number(variant.price))),
    );
    const items = categories
      .map((category) => ({ slug: category.slug, name: category.name, productCount: category.products.length }))
      .filter((category) => category.productCount > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
    return {
      items,
      priceRange: { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 },
    };
  }
}
