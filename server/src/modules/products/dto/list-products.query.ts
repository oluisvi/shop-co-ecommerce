import { Type } from "class-transformer";
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export const PRODUCT_SORTS = ["featured", "price-asc", "price-desc", "rating-desc"] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export class ListProductsQuery {
  @IsOptional() @IsString() @MaxLength(100) search?: string;
  @IsOptional() @IsString() @MaxLength(250) category?: string;
  @IsOptional() @IsIn(PRODUCT_SORTS) sort: ProductSort = "featured";
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) maxPrice?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 24;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
}
