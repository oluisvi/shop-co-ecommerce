import { Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsString, Matches, Max, MaxLength, Min, ValidateNested } from "class-validator";

export class ReconcileCartItemDto {
  @IsString() @MaxLength(128) @Matches(/\S/) variantId!: string;
  @IsInt() @Min(1) @Max(9) quantity!: number;
}

export class ReconcileCartDto {
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(50) @ValidateNested({ each: true }) @Type(() => ReconcileCartItemDto)
  items!: ReconcileCartItemDto[];
}
