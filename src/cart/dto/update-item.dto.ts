import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateItemDto {
  @ApiProperty({
    description: 'New quantity for the cart item',
    minimum: 1,
    example: 3,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}
