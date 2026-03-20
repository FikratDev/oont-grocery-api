import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  private readonly cartInclude = {
    items: {
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc' as const,
      },
    },
  } satisfies Prisma.CartInclude;

  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    await this.ensureUserExists(userId);

    await this.ensureCartExists(userId);

    return this.getFormattedCart(userId);
  }

  async addItem(userId: string, productId: string, quantity: number) {
    await this.ensureUserExists(userId);
    const cart = await this.ensureCartExists(userId);

    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });

      return this.getFormattedCart(userId);
    }

    await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });

    return this.getFormattedCart(userId);
  }

  async updateItem(userId: string, productId: string, quantity: number) {
    await this.ensureUserExists(userId);

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    await this.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });

    return this.getFormattedCart(userId);
  }

  async removeItem(userId: string, productId: string) {
    await this.ensureUserExists(userId);

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    await this.prisma.cartItem.delete({
      where: { id: item.id },
    });

    return this.getFormattedCart(userId);
  }

  async clearCart(userId: string) {
    await this.ensureUserExists(userId);

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return { userId, items: [], itemCount: 0, totalQuantity: 0 };
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getFormattedCart(userId);
  }

  private async ensureUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  private async ensureCartExists(userId: string) {
    return this.prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  private async getFormattedCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: this.cartInclude,
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return {
      id: cart.id,
      userId: cart.userId,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      itemCount: cart.items.length,
      totalQuantity: cart.items.reduce(
        (total, item) => total + item.quantity,
        0,
      ),
      items: cart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        product: {
          id: item.product.id,
          name: item.product.name,
          description: item.product.description,
          price: item.product.price.toString(),
          stock: item.product.stock,
          deletedAt: item.product.deletedAt,
          category: {
            id: item.product.category.id,
            name: item.product.category.name,
          },
        },
      })),
    };
  }
}
