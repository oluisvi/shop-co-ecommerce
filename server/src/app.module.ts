import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module.js";
import { ProductsModule } from "./modules/products/products.module.js";
import { CategoriesModule } from "./modules/categories/categories.module.js";
import { OrdersModule } from "./modules/orders/orders.module.js";
import { AccountModule } from "./modules/account/account.module.js";
import { StudioModule } from "./modules/studio/studio.module.js";
import { PaymentsModule } from "./modules/payments/payments.module.js";

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule, ProductsModule, CategoriesModule, OrdersModule, AccountModule, StudioModule, PaymentsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
