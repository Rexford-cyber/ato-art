import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  // Categories
  const categories = [
    { name: "Painting", slug: "painting", sortOrder: 1 },
    { name: "Photography", slug: "photography", sortOrder: 2 },
    { name: "Digital Art", slug: "digital-art", sortOrder: 3 },
    { name: "Sculpture", slug: "sculpture", sortOrder: 4 },
    { name: "Drawing", slug: "drawing", sortOrder: 5 },
    { name: "Mixed Media", slug: "mixed-media", sortOrder: 6 },
    { name: "Textile & Fibre", slug: "textile-fibre", sortOrder: 7 },
    { name: "Print", slug: "print", sortOrder: 8 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✓ Categories seeded");

  // Admin user
  const adminHash = await bcrypt.hash("admin123!", 12);
  await prisma.user.upsert({
    where: { email: "admin@atosart.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@atosart.com",
      username: "admin",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });
  console.log("✓ Admin user seeded (admin@atosart.com / admin123!)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
