import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: { [key: string]: jest.Mock };

  beforeEach(async () => {
    prisma = {
      order: { findUnique: jest.fn() },
      $transaction: jest.fn(),
      $queryRaw: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('throws NotFoundException when order does not exist', async () => {
      prisma.order.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });

    it('returns order when it exists', async () => {
      const mockOrder = { id: 'order-1', status: OrderStatus.PENDING, items: [] };
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      const result = await service.findOne('order-1');
      expect(result).toEqual(mockOrder);
    });
  });

  describe('cancel', () => {
    it('throws BadRequestException when order is already cancelled', async () => {
      const tx = {
        $queryRaw: jest.fn().mockResolvedValue([{ id: 'order-1', status: OrderStatus.CANCELLED }]),
        order: { findUnique: jest.fn() },
      };
      prisma.$transaction.mockImplementation((fn: (tx: typeof tx) => Promise<unknown>) => fn(tx));

      await expect(service.cancel('order-1')).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when order does not exist', async () => {
      const tx = {
        $queryRaw: jest.fn().mockResolvedValue([]),
      };
      prisma.$transaction.mockImplementation((fn: (tx: typeof tx) => Promise<unknown>) => fn(tx));

      await expect(service.cancel('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
