import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ProductsService } from "./products.service.js";
import { ListProductsQuery } from "./dto/list-products.query.js";
import { ReconcileCartDto } from "./dto/reconcile-cart.dto.js";

@Controller("products")
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(@Query() query: ListProductsQuery) {
    return this.products.list(query);
  }

  @Post("reconcile")
  reconcile(@Body() dto: ReconcileCartDto) {
    return this.products.reconcile(dto);
  }

  @Get(":slug")
  bySlug(@Param("slug") slug: string) {
    return this.products.bySlug(slug);
  }
}
