import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';

export class ProductResponseDto {
  @ApiProperty({
    description: 'Product id',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({ example: 'Bananas' })
  name: string;

  @ApiPropertyOptional({ example: 'Sweet ripe bananas' })
  description?: string | null;

  @ApiProperty({
    description: 'Product price represented as a decimal string',
    example: '9.99',
  })
  price: string;

  @ApiProperty({ example: 25 })
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

  @ApiProperty({
    type: () => CategoryResponseDto,
  })
  category: CategoryResponseDto;
}
