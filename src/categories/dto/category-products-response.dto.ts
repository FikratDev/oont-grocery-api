import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { CategoryResponseDto } from './category-response.dto';

class CategoryProductResponseDto {
  @ApiProperty({
    description: 'Product id',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({ example: 'Spinach' })
  name: string;

  @ApiPropertyOptional({ example: 'Baby spinach leaves' })
  description?: string | null;

  @ApiProperty({
    description: 'Product price represented as a decimal string',
    example: '4.50',
  })
  price: string;

  @ApiProperty({ example: 13 })
  stock: number;

  @ApiPropertyOptional({
    example: '2026-03-18T12:00:00.000Z',
    nullable: true,
  })
  deletedAt?: string | null;

  @ApiProperty({
    example: '2026-03-18T12:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    example: '2026-03-18T12:00:00.000Z',
  })
  updatedAt: string;

  @ApiProperty({
    description: 'Category id',
    format: 'uuid',
  })
  categoryId: string;
}

export class CategoryProductsResponseDto {
  @ApiProperty({
    type: () => CategoryResponseDto,
  })
  category: CategoryResponseDto;

  @ApiProperty({
    type: () => PaginationMetaDto,
  })
  meta: PaginationMetaDto;

  @ApiProperty({
    type: () => CategoryProductResponseDto,
    isArray: true,
  })
  data: CategoryProductResponseDto[];
}
