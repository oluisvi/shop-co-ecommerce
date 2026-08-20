import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString, IsUrl, Max, MaxLength, Min } from 'class-validator';
import { GarmentCondition } from '../../../generated/prisma/enums.js';
const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

export class UpdateStudioProductDto {
  @IsOptional() @Transform(trim) @IsString() @MaxLength(160) name?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(4000) description?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(120) collection?: string;
  @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) @MaxLength(2000) cardImage?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10_000_000) priceCents?: number;
  @IsOptional() @IsEnum(GarmentCondition) condition?: GarmentCondition;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(2000) conditionNotes?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(120) brand?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(240) material?: string;
  @IsOptional() @IsObject() measurements?: Record<string, string>;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(2000) imperfections?: string;
  @IsOptional() @Type(() => Boolean) @IsBoolean() published?: boolean;
}
