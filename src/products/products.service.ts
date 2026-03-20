import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(paginationQuery: PaginationQueryDto) {
    const page = paginationQuery.page ?? 1;
    const limit = paginationQuery.limit ?? 20;
    const skip = (page - 1) * limit;

    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({
        where: { deletedAt: null },
      }),
      this.prisma.product.findMany({
        where: { deletedAt: null },
        include: {
          category: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: products,
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }
}
