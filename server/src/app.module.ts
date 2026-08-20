import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module.js";
import { ProductsModule } from "./modules/products/products.module.js";
import { CategoriesModule } from "./modules/categories/categories.module.js";
import { OrdersModule } from "./modules/orders/orders.module.js";
import { AccountModule } from "./modules/account/account.module.js";

@Module({
  imports: [PrismaModule, ProductsModule, CategoriesModule, OrdersModule, AccountModule],
})
export class AppModule {}
