import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findProductsByCategory(
    categoryId: string,
    paginationQuery: PaginationQueryDto,
  ) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const page = paginationQuery.page ?? 1;
    const limit = paginationQuery.limit ?? 20;
    const skip = (page - 1) * limit;

    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({
        where: {
          categoryId,
          deletedAt: null,
        },
      }),
      this.prisma.product.findMany({
        where: {
          categoryId,
          deletedAt: null,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      category,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: products,
    };
  }
}
