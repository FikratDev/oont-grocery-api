import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Category id',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({ example: 'Fruits' })
  name: string;

  @ApiProperty({
    description: 'Category creation timestamp',
    example: '2026-03-18T12:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Category update timestamp',
    example: '2026-03-18T12:00:00.000Z',
  })
  updatedAt: string;
}
