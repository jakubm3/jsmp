import { prisma } from "../src/prisma.js";
import { hashPassword } from "../src/auth.js";
import { Role } from "@prisma/client";

async function main() {
  // Kategorie
  const electronics = await prisma.category.upsert({
    where: { id: "cat_electronics" },
    update: {},
    create: { id: "cat_electronics", name: "Elektronika" },
  });

  const laptops = await prisma.category.upsert({
    where: { id: "cat_laptops" },
    update: {},
    create: { id: "cat_laptops", name: "Laptopy", parentId: electronics.id },
  });

  const phones = await prisma.category.upsert({
    where: { id: "cat_phones" },
    update: {},
    create: { id: "cat_phones", name: "Telefony", parentId: electronics.id },
  });

  const home = await prisma.category.upsert({
    where: { id: "cat_home" },
    update: {},
    create: { id: "cat_home", name: "Dom i ogród" },
  });

  const kitchen = await prisma.category.upsert({
    where: { id: "cat_kitchen" },
    update: {},
    create: { id: "cat_kitchen", name: "Kuchnia", parentId: home.id },
  });

  // Użytkownicy
  await prisma.user.upsert({
    where: { email: "admin@local.test" },
    update: {},
    create: {
      email: "admin@local.test",
      passwordHash: await hashPassword("admin123"),
      name: "Admin",
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@local.test" },
    update: {},
    create: {
      email: "user@local.test",
      passwordHash: await hashPassword("user123"),
      name: "User",
      role: Role.USER,
    },
  });

  // (Opcjonalnie) czyść stare produkty demo, żeby seed był powtarzalny:
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});

  // Produkty demo
  await prisma.product.createMany({
    data: [
      {
        title: 'Laptop 14" (demo)',
        description: "Lekki laptop do pracy i nauki. Stan bardzo dobry, bateria trzyma ~6h.",
        price: 1999.99,
        sellerId: user.id,
        categoryId: laptops.id,
        isActive: true,
      },
      {
        title: "Smartfon (demo) 128GB",
        description: "Telefon 128GB, ekran OLED, minimalne ślady używania.",
        price: 899.0,
        sellerId: user.id,
        categoryId: phones.id,
        isActive: true,
      },
      {
        title: "Mikser kuchenny (demo)",
        description: "Mikser 800W, 5 poziomów prędkości, komplet końcówek.",
        price: 149.99,
        sellerId: user.id,
        categoryId: kitchen.id,
        isActive: true,
      },
      {
        title: "Laptop gamingowy (demo)",
        description: "Wydajny laptop do gier. 16GB RAM, szybki dysk SSD.",
        price: 3299.0,
        sellerId: user.id,
        categoryId: laptops.id,
        isActive: true,
      },
      {
        title: "Telefon budżetowy (demo)",
        description: "Prosty telefon do podstawowych zadań. Dobry na start.",
        price: 499.0,
        sellerId: user.id,
        categoryId: phones.id,
        isActive: true,
      },
    ],
  });

  // Dodaj obrazki do wszystkich produktów (po 1)
  const products = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });
  const urls = [
    "https://picsum.photos/seed/laptop1/640/480",
    "https://picsum.photos/seed/phone1/640/480",
    "https://picsum.photos/seed/kitchen1/640/480",
    "https://picsum.photos/seed/laptop2/640/480",
    "https://picsum.photos/seed/phone2/640/480",
  ];

  for (let i = 0; i < products.length; i++) {
    await prisma.productImage.create({
      data: { productId: products[i].id, url: urls[i % urls.length] },
    });
  }

  console.log("Seed OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
