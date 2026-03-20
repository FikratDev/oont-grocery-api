import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CartProductCategoryDto {
  @ApiProperty({
    description: 'Category id',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({ example: 'Vegetables' })
  name: string;
}

class CartProductDto {
  @ApiProperty({
    description: 'Product id',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({ example: 'Tomatoes' })
  name: string;

  @ApiPropertyOptional({ example: 'Fresh cherry tomatoes' })
  description?: string | null;

  @ApiProperty({
    description: 'Product price represented as a decimal string',
    example: '5.99',
  })
  price: string;

  @ApiProperty({ example: 18 })
  stock: number;

  @ApiPropertyOptional({
    description:
      'Soft deletion timestamp when the product is no longer sellable',
    example: '2026-03-18T12:00:00.000Z',
    nullable: true,
  })
  deletedAt?: string | null;

  @ApiProperty({
    type: () => CartProductCategoryDto,
  })
  category: CartProductCategoryDto;
}

class CartItemResponseDto {
  @ApiProperty({
    description: 'Cart item id',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Product id',
    format: 'uuid',
  })
  productId: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({
    example: '2026-03-18T12:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    example: '2026-03-18T12:00:00.000Z',
  })
  updatedAt: string;

  @ApiProperty({
    type: () => CartProductDto,
  })
  product: CartProductDto;
}

export class CartResponseDto {
  @ApiProperty({
    description: 'Cart id',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Owner user id',
    format: 'uuid',
  })
  userId: string;

  @ApiProperty({
    example: '2026-03-18T12:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    example: '2026-03-18T12:00:00.000Z',
  })
  updatedAt: string;

  @ApiProperty({
    description: 'Number of distinct items in the cart',
    example: 2,
  })
  itemCount: number;

  @ApiProperty({
    description: 'Sum of all item quantities in the cart',
    example: 5,
  })
  totalQuantity: number;

  @ApiProperty({
    type: () => CartItemResponseDto,
    isArray: true,
  })
  items: CartItemResponseDto[];
}
