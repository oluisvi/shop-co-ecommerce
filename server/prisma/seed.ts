import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to seed SHOP.CO");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

import { seedProducts, type SeedProduct } from "./catalog-seed-data.js";

const categorySlug: Record<SeedProduct["category"], string> = {
  "T-shirts": "t-shirts",
  Shirts: "shirts",
  Jeans: "jeans",
  Shorts: "shorts",
  Polos: "polos",
};

function slugifyPart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function variantsFor(product: SeedProduct) {
  if (!product.colors?.length || !product.sizes?.length) {
    return [
      {
        id: `${product.id}-default`,
        sku: `SHOP-${product.id.toUpperCase().replace(/-/g, "-")}-DEFAULT`,
        color: null,
        colorValue: null,
        size: null,
        price: product.price,
        compareAtPrice: product.previousPrice ?? null,
      },
    ];
  }

  return product.colors.flatMap((color) =>
    product.sizes!.map((size) => ({
      id: `${product.id}-${slugifyPart(color.name)}-${slugifyPart(size)}`,
      sku: `SHOP-${product.id}-${slugifyPart(color.name)}-${slugifyPart(size)}`.toUpperCase(),
      color: color.name,
      colorValue: color.value,
      size,
      price: product.price,
      compareAtPrice: product.previousPrice ?? null,
    })),
  );
}

async function main() {
  for (const name of Object.keys(categorySlug) as SeedProduct["category"][]) {
    await prisma.category.upsert({
      where: { slug: categorySlug[name] },
      update: { name },
      create: { slug: categorySlug[name], name },
    });
  }

  for (const product of seedProducts) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: categorySlug[product.category] },
    });

    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        categoryId: category.id,
        collection: product.collection,
        cardImage: product.cardImage,
        rating: product.rating,
        status: "ACTIVE",
      },
      create: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        categoryId: category.id,
        collection: product.collection,
        cardImage: product.cardImage,
        rating: product.rating,
        status: "ACTIVE",
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    const images = product.gallery?.length
      ? product.gallery
      : [{ url: product.cardImage, alt: product.name }];
    await prisma.productImage.createMany({
      data: images.map((image, position) => ({
        productId: product.id,
        url: image.url,
        alt: image.alt,
        position,
      })),
    });

    const desiredVariants = variantsFor(product);
    await prisma.productVariant.updateMany({
      where: { productId: product.id, id: { notIn: desiredVariants.map((variant) => variant.id) } },
      data: { active: false },
    });

    for (const variant of desiredVariants) {
      await prisma.productVariant.upsert({
        where: { id: variant.id },
        update: {
          sku: variant.sku,
          color: variant.color,
          colorValue: variant.colorValue,
          size: variant.size,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          active: true,
        },
        create: {
          id: variant.id,
          productId: product.id,
          sku: variant.sku,
          color: variant.color,
          colorValue: variant.colorValue,
          size: variant.size,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          active: true,
        },
      });
      await prisma.inventory.upsert({
        where: { variantId: variant.id },
        update: {},
        create: { variantId: variant.id, quantity: 20, reservedQuantity: 0 },
      });
    }
  }
}

main()
  .then(() => console.log(`Seeded ${seedProducts.length} SHOP.CO products.`))
  .finally(async () => prisma.$disconnect());
