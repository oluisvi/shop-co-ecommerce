import { Body, Controller, Post } from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto.js";
import { PaymentsService } from "../payments/payments.service.js";
@Controller("orders")
export class OrdersController {
  constructor(private readonly payments: PaymentsService) {}
  @Post() create(@Body() dto: CreateOrderDto) { return this.payments.createCheckout(dto); }
}
