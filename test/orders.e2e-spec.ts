import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import request from 'supertest';

describe('Orders concurrency (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let firstUserId: string;
  let secondUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.cartItem.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    const [firstUser, secondUser] = await Promise.all([
      prisma.user.create({ data: {} }),
      prisma.user.create({ data: {} }),
    ]);

    firstUserId = firstUser.id;
    secondUserId = secondUser.id;

    const category = await prisma.category.create({
      data: { name: 'Concurrency Test Category' },
    });

    const product = await prisma.product.create({
      data: {
        name: 'Limited Stock Product',
        price: '10.00',
        stock: 1,
        categoryId: category.id,
      },
    });

    await prisma.cart.create({
      data: {
        userId: firstUserId,
        items: {
          create: {
            productId: product.id,
            quantity: 1,
          },
        },
      },
    });

    await prisma.cart.create({
      data: {
        userId: secondUserId,
        items: {
          create: {
            productId: product.id,
            quantity: 1,
          },
        },
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows only one parallel checkout when a single item is left in stock', async () => {
    const server = app.getHttpServer();

    const [firstResponse, secondResponse] = await Promise.all([
      request(server).post('/orders').send({ userId: firstUserId }),
      request(server).post('/orders').send({ userId: secondUserId }),
    ]);

    const responses = [firstResponse, secondResponse];
    const successResponses = responses.filter(
      (response) => response.status === 201,
    );
    const badRequestResponses = responses.filter(
      (response) => response.status === 400,
    );

    expect(successResponses).toHaveLength(1);
    expect(badRequestResponses).toHaveLength(1);
    expect(badRequestResponses[0].body.failedItems).toEqual([
      expect.objectContaining({
        reason: 'OUT_OF_STOCK',
        requestedQuantity: 1,
        availableStock: 0,
      }),
    ]);

    const product = await prisma.product.findFirstOrThrow({
      where: { name: 'Limited Stock Product' },
    });
    const orders = await prisma.order.findMany();
    const remainingCartItems = await prisma.cartItem.findMany();

    expect(product.stock).toBe(0);
    expect(orders).toHaveLength(1);
    expect(remainingCartItems).toHaveLength(1);
  });
});
