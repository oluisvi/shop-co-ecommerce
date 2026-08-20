import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

export class UpdateProfileDto {
  @IsOptional() @Transform(trim) @IsString() @MaxLength(80) firstName?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(80) lastName?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(30) phone?: string | null;
}
