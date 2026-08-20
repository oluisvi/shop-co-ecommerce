import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString, IsUrl, Matches, Max, MaxLength, Min } from 'class-validator';
import { GarmentCondition } from '../../../generated/prisma/enums.js';

const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

export class CreateStudioProductDto {
  @Transform(trim) @IsString() @MaxLength(160) name!: string;
  @Transform(trim) @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) @MaxLength(160) slug!: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(4000) description?: string;
  @Transform(trim) @IsString() @MaxLength(64) categoryId!: string;
  @Transform(trim) @IsString() @MaxLength(120) collection!: string;
  @IsUrl({ protocols: ['https'], require_protocol: true }) @MaxLength(2000) cardImage!: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(10_000_000) priceCents!: number;
  @IsOptional() @IsEnum(GarmentCondition) condition?: GarmentCondition;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(2000) conditionNotes?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(120) brand?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(240) material?: string;
  @IsOptional() @IsObject() measurements?: Record<string, string>;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(2000) imperfections?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(80) size?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(80) color?: string;
  @Type(() => Boolean) @IsBoolean() published!: boolean;
}
