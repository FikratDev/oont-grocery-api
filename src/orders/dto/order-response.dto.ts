import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

class OrderItemResponseDto {
  @ApiProperty({
    description: 'Order item id',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({
    description: 'Product id',
    format: 'uuid',
  })
  productId: string;

  @ApiProperty({ example: 'Milk' })
  productNameSnapshot: string;

  @ApiProperty({
    description: 'Locked product price represented as a decimal string',
    example: '7.99',
  })
  productPriceSnapshot: string;

  @ApiProperty({
    example: '2026-03-18T12:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Parent order id',
    format: 'uuid',
  })
  orderId: string;
}

export class OrderResponseDto {
  @ApiProperty({
    description: 'Order id',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Order owner id',
    format: 'uuid',
  })
  userId: string;

  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ApiProperty({
    example: '2026-03-18T12:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    example: '2026-03-18T12:00:00.000Z',
  })
  updatedAt: string;

  @ApiProperty({
    type: () => OrderItemResponseDto,
    isArray: true,
  })
  items: OrderItemResponseDto[];
}
