import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const users = await prisma.user.createMany({
    data: [{}, {}, {}],
  });

  const dairy = await prisma.category.create({
    data: { name: 'Dairy' },
  });

  const fruits = await prisma.category.create({
    data: { name: 'Fruits' },
  });

  const bakery = await prisma.category.create({
    data: { name: 'Bakery' },
  });

  const beverages = await prisma.category.create({
    data: { name: 'Beverages' },
  });

  const snacks = await prisma.category.create({
    data: { name: 'Snacks' },
  });

  await prisma.product.createMany({
    data: [
      {
        name: 'Whole Milk',
        description: '1L fresh whole milk',
        price: '2.50',
        stock: 25,
        categoryId: dairy.id,
      },
      {
        name: 'Cheddar Cheese',
        description: '200g cheddar block',
        price: '4.20',
        stock: 15,
        categoryId: dairy.id,
      },
      {
        name: 'Greek Yogurt',
        description: 'Plain greek yogurt',
        price: '3.10',
        stock: 18,
        categoryId: dairy.id,
      },
      {
        name: 'Butter',
        description: 'Salted butter 250g',
        price: '2.80',
        stock: 12,
        categoryId: dairy.id,
      },
      {
        name: 'Apple',
        description: 'Fresh red apple',
        price: '0.80',
        stock: 100,
        categoryId: fruits.id,
      },
      {
        name: 'Banana',
        description: 'Organic banana',
        price: '0.50',
        stock: 120,
        categoryId: fruits.id,
      },
      {
        name: 'Orange',
        description: 'Juicy orange',
        price: '0.90',
        stock: 90,
        categoryId: fruits.id,
      },
      {
        name: 'Strawberries',
        description: '250g strawberries pack',
        price: '3.60',
        stock: 30,
        categoryId: fruits.id,
      },
      {
        name: 'Bread Loaf',
        description: 'Fresh white bread loaf',
        price: '1.90',
        stock: 20,
        categoryId: bakery.id,
      },
      {
        name: 'Croissant',
        description: 'Buttery croissant',
        price: '1.40',
        stock: 35,
        categoryId: bakery.id,
      },
      {
        name: 'Bagel',
        description: 'Classic sesame bagel',
        price: '1.20',
        stock: 28,
        categoryId: bakery.id,
      },
      {
        name: 'Muffin',
        description: 'Blueberry muffin',
        price: '2.10',
        stock: 22,
        categoryId: bakery.id,
      },
      {
        name: 'Orange Juice',
        description: '1L orange juice',
        price: '3.20',
        stock: 16,
        categoryId: beverages.id,
      },
      {
        name: 'Sparkling Water',
        description: '500ml sparkling water',
        price: '1.00',
        stock: 40,
        categoryId: beverages.id,
      },
      {
        name: 'Cola',
        description: '330ml cola can',
        price: '1.30',
        stock: 50,
        categoryId: beverages.id,
      },
      {
        name: 'Iced Tea',
        description: 'Lemon iced tea',
        price: '1.70',
        stock: 26,
        categoryId: beverages.id,
      },
      {
        name: 'Potato Chips',
        description: 'Salted potato chips',
        price: '2.30',
        stock: 45,
        categoryId: snacks.id,
      },
      {
        name: 'Chocolate Bar',
        description: 'Milk chocolate bar',
        price: '1.50',
        stock: 60,
        categoryId: snacks.id,
      },
      {
        name: 'Popcorn',
        description: 'Butter popcorn',
        price: '2.00',
        stock: 33,
        categoryId: snacks.id,
      },
      {
        name: 'Mixed Nuts',
        description: 'Roasted mixed nuts pack',
        price: '4.90',
        stock: 17,
        categoryId: snacks.id,
      },
    ],
  });

  const createdUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
  });

  console.log('Seed completed');
  console.log(
    'User IDs:',
    createdUsers.map((user) => user.id),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });