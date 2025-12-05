import prisma from "../src/lib/prisma";

async function main() {
  // ✅ Insert demo user
  const user = await prisma.user.create({
    data: {
      email: "demo@example.com",
      password: "hashedpassword123",
    },
  });

  // ✅ Insert demo budget linked to that user
  await prisma.budget.create({
    data: {
      title: "Demo Budget",
      amount: 5000,
      userId: user.id,
    },
  });

  console.log("🌱 Seed data inserted successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });