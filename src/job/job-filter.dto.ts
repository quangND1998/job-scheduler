import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Transform,Type } from 'class-transformer';

export class JobFilterDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) =>  Number(value) )
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Transform(({ value }) =>  Number(value) )
  per_page: number = 20;

  @IsOptional()
  @IsString()
  jobId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsString()
  endpoint?: string;

  @IsOptional()
  @IsString()
  bean?: string;
} 