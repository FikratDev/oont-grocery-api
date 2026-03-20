import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

type FailedOrderItem = {
  productId: string;
  productName: string;
  requestedQuantity: number;
  availableStock: number;
  reason: 'OUT_OF_STOCK' | 'PRODUCT_UNAVAILABLE';
};

@Injectable()
export class OrdersService {
  private readonly cartInclude = {
    items: {
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'asc' as const,
      },
    },
  } satisfies Prisma.CartInclude;

  private readonly orderInclude = {
    items: {
      orderBy: {
        createdAt: 'asc' as const,
      },
    },
  } satisfies Prisma.OrderInclude;

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const cartId = await this.lockCartByUserId(tx, dto.userId);

      const transactionalCart = await tx.cart.findUnique({
        where: { id: cartId },
        include: this.cartInclude,
      });

      if (!transactionalCart || transactionalCart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      const productIds = this.getSortedUniqueProductIds(
        transactionalCart.items.map((item) => item.productId),
      );

      const lockedProducts = await this.lockProducts(tx, productIds, false);
      const lockedProductsById = new Map(
        lockedProducts.map((product) => [product.id, product]),
      );

      if (lockedProducts.length !== productIds.length) {
        const failedItems = transactionalCart.items
          .filter((item) => !lockedProductsById.has(item.productId))
          .map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            requestedQuantity: item.quantity,
            availableStock: 0,
            reason: 'PRODUCT_UNAVAILABLE' as const,
          }));

        throw new BadRequestException({
          message: 'Some cart items could not be ordered',
          failedItems,
        });
      }

      const failedItems: FailedOrderItem[] = [];

      for (const item of transactionalCart.items) {
        const lockedProduct = lockedProductsById.get(item.productId);

        if (!lockedProduct) {
          failedItems.push({
            productId: item.productId,
            productName: item.product.name,
            requestedQuantity: item.quantity,
            availableStock: 0,
            reason: 'PRODUCT_UNAVAILABLE',
          });
          continue;
        }

        if (lockedProduct.stock < item.quantity) {
          failedItems.push({
            productId: item.productId,
            productName: item.product.name,
            requestedQuantity: item.quantity,
            availableStock: lockedProduct.stock,
            reason: 'OUT_OF_STOCK',
          });
        }
      }

      if (failedItems.length > 0) {
        throw new BadRequestException({
          message: 'Some cart items could not be ordered',
          failedItems,
        });
      }

      for (const item of transactionalCart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      const order = await tx.order.create({
        data: {
          userId: dto.userId,
          items: {
            create: transactionalCart.items.map((item) => ({
              quantity: item.quantity,
              productId: item.productId,
              productNameSnapshot: item.product.name,
              productPriceSnapshot: item.product.price,
            })),
          },
        },
        include: this.orderInclude,
      });

      await tx.cartItem.deleteMany({
        where: { cartId: transactionalCart.id },
      });

      return order;
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: this.orderInclude,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async cancel(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const lockedOrders = await tx.$queryRaw<
        Array<{ id: string; status: OrderStatus }>
      >(Prisma.sql`
        SELECT id, status
        FROM "orders"
        WHERE id = ${id}
        FOR UPDATE
      `);

      const lockedOrder = lockedOrders[0];

      if (!lockedOrder) {
        throw new NotFoundException('Order not found');
      }

      if (lockedOrder.status === OrderStatus.CANCELLED) {
        throw new BadRequestException('Order is already cancelled');
      }

      const order = await tx.order.findUnique({
        where: { id },
        include: this.orderInclude,
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      const productIds = this.getSortedUniqueProductIds(
        order.items.map((item) => item.productId),
      );
      const lockedProducts = await this.lockProducts(tx, productIds, true);

      if (lockedProducts.length !== productIds.length) {
        throw new NotFoundException(
          'One or more ordered products could not be restored',
        );
      }

      const quantitiesByProductId = new Map<string, number>();

      for (const item of order.items) {
        const currentQuantity = quantitiesByProductId.get(item.productId) ?? 0;
        quantitiesByProductId.set(
          item.productId,
          currentQuantity + item.quantity,
        );
      }

      for (const [productId, quantity] of quantitiesByProductId) {
        await tx.product.update({
          where: { id: productId },
          data: {
            stock: {
              increment: quantity,
            },
          },
        });
      }

      await tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
        },
      });

      const cancelledOrder = await tx.order.findUnique({
        where: { id },
        include: this.orderInclude,
      });

      if (!cancelledOrder) {
        throw new NotFoundException('Order not found');
      }

      return cancelledOrder;
    });
  }

  private getSortedUniqueProductIds(productIds: string[]) {
    return [...new Set(productIds)].sort((left, right) =>
      left.localeCompare(right),
    );
  }

  private async lockCartByUserId(tx: Prisma.TransactionClient, userId: string) {
    const lockedCarts = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT id
      FROM "carts"
      WHERE "userId" = ${userId}
      FOR UPDATE
    `);

    const lockedCart = lockedCarts[0];

    if (!lockedCart) {
      throw new NotFoundException('Cart not found');
    }

    return lockedCart.id;
  }

  private async lockProducts(
    tx: Prisma.TransactionClient,
    productIds: string[],
    includeDeleted: boolean,
  ) {
    if (productIds.length === 0) {
      return [];
    }

    const deletedFilter = includeDeleted
      ? Prisma.empty
      : Prisma.sql` AND "deletedAt" IS NULL`;

    return tx.$queryRaw<
      Array<{ id: string; stock: number; deletedAt: Date | null }>
    >(Prisma.sql`
      SELECT id, stock, "deletedAt"
      FROM "products"
      WHERE id IN (${Prisma.join(productIds)})
      ${deletedFilter}
      ORDER BY id
      FOR UPDATE
    `);
  }
}
