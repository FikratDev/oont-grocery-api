import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CategoryProductsResponseDto } from './dto/category-products-response.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CategoriesService } from './categories.service';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all categories' })
  @ApiOkResponse({ type: CategoryResponseDto, isArray: true })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id/products')
  @ApiOperation({ summary: 'List products by category' })
  @ApiOkResponse({ type: CategoryProductsResponseDto })
  @ApiNotFoundResponse({ description: 'Category not found' })
  findProductsByCategory(
    @Param('id') id: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.categoriesService.findProductsByCategory(id, paginationQuery);
  }
}
