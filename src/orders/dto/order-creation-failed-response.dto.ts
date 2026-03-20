import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class FailedOrderItemDto {
  @ApiProperty({
    description: 'Product id that could not be ordered',
    format: 'uuid',
  })
  productId: string;

  @ApiProperty({ example: 'Limited Stock Product' })
  productName: string;

  @ApiProperty({ example: 2 })
  requestedQuantity: number;

  @ApiProperty({ example: 0 })
  availableStock: number;

  @ApiProperty({
    enum: ['OUT_OF_STOCK', 'PRODUCT_UNAVAILABLE'],
    example: 'OUT_OF_STOCK',
  })
  reason: 'OUT_OF_STOCK' | 'PRODUCT_UNAVAILABLE';
}

export class OrderCreationFailedResponseDto {
  @ApiProperty({
    example: 'Some cart items could not be ordered',
  })
  message: string;

  @ApiPropertyOptional({
    type: () => FailedOrderItemDto,
    isArray: true,
  })
  failedItems?: FailedOrderItemDto[];
}
