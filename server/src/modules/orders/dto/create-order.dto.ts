import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

export class CustomerDto {
  @IsEmail() @MaxLength(254) email!: string;
  @IsString() @MinLength(1) @MaxLength(100) @Matches(/\S/) firstName!: string;
  @IsString() @MinLength(1) @MaxLength(100) @Matches(/\S/) lastName!: string;
}

export class ShippingAddressDto {
  @IsString() @MinLength(1) @MaxLength(100) @Matches(/\S/) firstName!: string;
  @IsString() @MinLength(1) @MaxLength(100) @Matches(/\S/) lastName!: string;
  @IsString() @MinLength(1) @MaxLength(200) @Matches(/\S/) addressLine1!: string;
  @IsOptional() @IsString() @MaxLength(200) addressLine2?: string;
  @IsString() @MinLength(1) @MaxLength(100) @Matches(/\S/) city!: string;
  @IsString() @MinLength(1) @MaxLength(100) @Matches(/\S/) state!: string;
  @IsString() @MinLength(1) @MaxLength(30) @Matches(/\S/) postalCode!: string;
  @IsString() @Matches(/^[A-Za-z]{2}$/) country!: string;
}

export class OrderLineDto {
  @IsString() @MaxLength(128) @Matches(/\S/) variantId!: string;
  @IsInt() @Min(1) @Max(9) quantity!: number;
}

export class CreateOrderDto {
  @IsDefined() @ValidateNested() @Type(() => CustomerDto) customer!: CustomerDto;
  @IsDefined() @ValidateNested() @Type(() => ShippingAddressDto) shippingAddress!: ShippingAddressDto;
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(50) @ValidateNested({ each: true }) @Type(() => OrderLineDto)
  items!: OrderLineDto[];
}
