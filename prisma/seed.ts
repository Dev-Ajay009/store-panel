import { PrismaClient, type ProductStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const img = (id: string) =>
  `https://images.unsplash.com/${id}?w=600&q=70&auto=format&fit=crop`;

const users = [
  {
    email: "admin@example.com",
    name: "Alex Admin",
    password: "Admin123!",
    role: "ADMIN" as const,
  },
  {
    email: "manager@example.com",
    name: "Morgan Manager",
    password: "Manager123!",
    role: "MANAGER" as const,
  },
];

const categories = [
  { name: "Food", slug: "food" },
  { name: "Drink", slug: "drink" },
  { name: "Dessert", slug: "dessert" },
  { name: "Other", slug: "other" },
];

type SeedProduct = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  status: ProductStatus;
  image?: string;
};

const products: SeedProduct[] = [
  {
    name: "Margherita Pizza",
    description: "Classic Italian pizza with tomato and mozzarella",
    price: 12,
    stock: 20,
    category: "Food",
    status: "ACTIVE",
    image: img("photo-1513104890138-7c749659a591"),
  },
  {
    name: "Classic Burger",
    description: "Beef burger with lettuce and tomato",
    price: 10,
    stock: 15,
    category: "Food",
    status: "ACTIVE",
    image: img("photo-1568901346375-23c9450c58cd"),
  },
  {
    name: "Coca Cola",
    description: "330ml Coca Cola",
    price: 3,
    stock: 50,
    category: "Drink",
    status: "INACTIVE",
  },
  {
    name: "Pepperoni Pizza",
    description: "Tomato sauce, mozzarella and spicy pepperoni",
    price: 14,
    stock: 18,
    category: "Food",
    status: "ACTIVE",
  },
  {
    name: "Four Cheese Pizza",
    description: "Mozzarella, gorgonzola, parmesan and fontina",
    price: 15.5,
    stock: 0,
    category: "Food",
    status: "INACTIVE",
  },
  {
    name: "Veggie Pizza",
    description: "Peppers, mushrooms, olives and red onion",
    price: 13,
    stock: 9,
    category: "Food",
    status: "ACTIVE",
  },
  {
    name: "Chicken Caesar Salad",
    description: "Romaine, grilled chicken, croutons and parmesan",
    price: 9.5,
    stock: 12,
    category: "Food",
    status: "ACTIVE",
    image: img("photo-1512621776951-a57141f2eefd"),
  },
  {
    name: "Spaghetti Carbonara",
    description: "Pasta with egg, pecorino, guanciale and black pepper",
    price: 13.5,
    stock: 14,
    category: "Food",
    status: "ACTIVE",
  },
  {
    name: "Salmon Sushi Set",
    description: "Eight pieces of salmon nigiri and maki",
    price: 18,
    stock: 6,
    category: "Food",
    status: "ACTIVE",
    image: img("photo-1579871494447-9811cf80d66c"),
  },
  {
    name: "Cheese Burger",
    description: "Beef patty with cheddar, pickles and onions",
    price: 11,
    stock: 22,
    category: "Food",
    status: "ACTIVE",
  },
  {
    name: "Fries",
    description: "Crispy salted fries",
    price: 4,
    stock: 60,
    category: "Food",
    status: "ACTIVE",
  },
  {
    name: "Sprite",
    description: "330ml Sprite",
    price: 3,
    stock: 40,
    category: "Drink",
    status: "ACTIVE",
  },
  {
    name: "Fresh Orange Juice",
    description: "Freshly squeezed, 400ml",
    price: 5,
    stock: 25,
    category: "Drink",
    status: "ACTIVE",
    image: img("photo-1600271886742-f049cd451bba"),
  },
  {
    name: "Espresso",
    description: "Single shot of house blend espresso",
    price: 2.5,
    stock: 100,
    category: "Drink",
    status: "ACTIVE",
    image: img("photo-1509042239860-f550ce710b93"),
  },
  {
    name: "Iced Latte",
    description: "Espresso with cold milk over ice",
    price: 4.5,
    stock: 35,
    category: "Drink",
    status: "ACTIVE",
  },
  {
    name: "Sparkling Water",
    description: "500ml sparkling mineral water",
    price: 2,
    stock: 80,
    category: "Drink",
    status: "INACTIVE",
  },
  {
    name: "Chocolate Cake",
    description: "Rich chocolate sponge with ganache",
    price: 6,
    stock: 10,
    category: "Dessert",
    status: "ACTIVE",
    image: img("photo-1578985545062-69928b1d9587"),
  },
  {
    name: "Tiramisu",
    description: "Coffee soaked ladyfingers with mascarpone cream",
    price: 6.5,
    stock: 8,
    category: "Dessert",
    status: "ACTIVE",
  },
  {
    name: "Vanilla Ice Cream",
    description: "Two scoops of vanilla bean ice cream",
    price: 4,
    stock: 30,
    category: "Dessert",
    status: "ACTIVE",
    image: img("photo-1563805042-7684c019e1cb"),
  },
  {
    name: "Pancakes",
    description: "Stack of three with maple syrup and berries",
    price: 7,
    stock: 16,
    category: "Dessert",
    status: "ACTIVE",
    image: img("photo-1567620905732-2d1ec7ab7445"),
  },
  {
    name: "Cheesecake",
    description: "New York style cheesecake",
    price: 6,
    stock: 0,
    category: "Dessert",
    status: "INACTIVE",
  },
  {
    name: "Ketchup Sachet",
    description: "Single serve tomato ketchup",
    price: 0.2,
    stock: 500,
    category: "Other",
    status: "ACTIVE",
  },
  {
    name: "Paper Bag",
    description: "Recyclable takeaway bag",
    price: 0.1,
    stock: 300,
    category: "Other",
    status: "ACTIVE",
  },
  {
    name: "Gift Card",
    description: "Store gift card worth $25",
    price: 25,
    stock: 50,
    category: "Other",
    status: "INACTIVE",
  },
];

async function main() {
  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await db.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, passwordHash },
      create: { email: u.email, name: u.name, role: u.role, passwordHash },
    });
  }

  for (const c of categories) {
    await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
  }

  const admin = await db.user.findUniqueOrThrow({
    where: { email: "admin@example.com" },
  });
  const categoryIds = new Map(
    (await db.category.findMany()).map((c) => [c.name, c.id]),
  );

  await db.product.deleteMany();

  const now = Date.now();
  const hour = 60 * 60 * 1000;

  await db.product.createMany({
    data: products.map((p, i) => {
      const createdAt = new Date(now - (products.length - i) * 17 * hour);
      return {
        name: p.name,
        description: p.description,
        priceCents: Math.round(p.price * 100),
        stock: p.stock,
        status: p.status,
        imageUrl: p.image ?? null,
        categoryId: categoryIds.get(p.category)!,
        createdById: admin.id,
        createdAt,
        updatedAt: createdAt,
      };
    }),
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
