import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedProductsResponseDto } from './dto/paginated-products-response.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List all available products' })
  @ApiOkResponse({ type: PaginatedProductsResponseDto })
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.productsService.findAll(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details by id' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ description: 'Product not found' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}
