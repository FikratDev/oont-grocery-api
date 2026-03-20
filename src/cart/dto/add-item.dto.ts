import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class AddItemDto {
  @ApiProperty({
    description: 'Product id to add to the cart',
    format: 'uuid',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'How many units to add',
    minimum: 1,
    example: 2,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}
