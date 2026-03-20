import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description: 'User id that owns the cart to checkout',
    format: 'uuid',
  })
  @IsUUID()
  userId: string;
}
