import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { ApiError } from "../../common/errors/api-error.js";
import type { ListProductsQuery } from "./dto/list-products.query.js";
import type { ReconcileCartDto } from "./dto/reconcile-cart.dto.js";
import { availableQuantity, presentProduct } from "./product-presenter.js";

const productInclude = {
  category: true,
  images: { orderBy: { position: "asc" as const } },
  variants: { include: { inventory: true }, orderBy: { createdAt: "asc" as const } },
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListProductsQuery) {
    const records = await this.prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: productInclude,
      orderBy: { createdAt: "asc" },
    });

    let items = records.map((record) => presentProduct(record));
    const search = query.search?.trim().toLowerCase();
    if (search) {
      items = items.filter((item) =>
        `${item.name} ${item.description ?? ""} ${item.category}`.toLowerCase().includes(search),
      );
    }
    if (query.category) {
      const categories = query.category.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
      items = items.filter((item) =>
        categories.includes(item.categorySlug.toLowerCase()) || categories.includes(item.category.toLowerCase()),
      );
    }
    if (query.maxPrice != null) items = items.filter((item) => item.price <= query.maxPrice!);

    if (query.sort === "price-asc") items.sort((a, b) => a.price - b.price);
    else if (query.sort === "price-desc") items.sort((a, b) => b.price - a.price);
    else if (query.sort === "rating-desc") items.sort((a, b) => b.rating - a.rating);

    const page = query.page ?? 1;
    const limit = query.limit ?? 24;
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    return {
      items: items.slice(start, start + limit),
      pagination: { page, limit, total, totalPages },
    };
  }

  async bySlug(slug: string) {
    const product = await this.prisma.product.findUnique({ where: { slug }, include: productInclude });
    if (!product || product.status !== "ACTIVE") {
      throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");
    }
    return presentProduct(product);
  }

  async reconcile(dto: ReconcileCartDto) {
    const variantIds = [...new Set(dto.items.map((line) => line.variantId))];
    const records = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { inventory: true, product: { include: productInclude } },
    });
    const variants = new Map(records.map((variant) => [variant.id, variant]));
    const items = [];
    const issues: { variantId: string; type: string; message: string }[] = [];

    for (const line of dto.items) {
      const variant = variants.get(line.variantId);
      if (!variant) {
        issues.push({ variantId: line.variantId, type: "REMOVED", message: "This item no longer exists." });
        continue;
      }
      if (!variant.active || variant.product.status !== "ACTIVE") {
        issues.push({ variantId: line.variantId, type: "UNAVAILABLE", message: "This item is no longer available." });
        continue;
      }
      const available = availableQuantity(variant.inventory);
      if (available < line.quantity) {
        issues.push({
          variantId: line.variantId,
          type: "INSUFFICIENT_STOCK",
          message: available ? `Only ${available} left in stock.` : "This item is out of stock.",
        });
      }
      const product = presentProduct(variant.product);
      const current = product.variants.find((item) => item.id === variant.id)!;
      items.push({
        variantId: variant.id,
        requestedQuantity: line.quantity,
        quantity: Math.min(line.quantity, available),
        availableQuantity: available,
        product,
        variant: current,
        lineTotal: current.price * line.quantity,
      });
    }
    return { items, issues };
  }
}
