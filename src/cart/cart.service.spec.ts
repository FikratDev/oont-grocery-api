import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CartService', () => {
  let service: CartService;
  let prisma: { [key: string]: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn() },
      cart: { findUnique: jest.fn(), upsert: jest.fn() },
      cartItem: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), deleteMany: jest.fn() },
      product: { findFirst: jest.fn() },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateItem', () => {
    it('throws NotFoundException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.updateItem('bad-user', 'prod-1', 2)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when cart does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      prisma.cart.findUnique.mockResolvedValue(null);
      await expect(service.updateItem('user-1', 'prod-1', 2)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeItem', () => {
    it('throws NotFoundException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.removeItem('bad-user', 'prod-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addItem', () => {
    it('throws NotFoundException when product does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      prisma.cart.upsert.mockResolvedValue({ id: 'cart-1', userId: 'user-1' });
      prisma.product.findFirst.mockResolvedValue(null);
      await expect(service.addItem('user-1', 'bad-prod', 1)).rejects.toThrow(NotFoundException);
    });
  });
});
