/**
 * Database Seed Script
 * Populates the database with sample data based on the thesis
 */

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Create Prisma client with adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  await prisma.rating.deleteMany();
  await prisma.guitar.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemConfig.deleteMany();

  console.log("📦 Cleared existing data");

  // Set default K value
  await prisma.systemConfig.create({
    data: { key: "k_neighbors", value: "4" },
  });

  // Create users (5 users + 1 admin from thesis)
  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = await Promise.all([
    prisma.user.create({
      data: { name: "Admin", email: "admin@example.com", password: hashedPassword, role: "admin" },
    }),
    prisma.user.create({
      data: { name: "User 1", email: "user1@example.com", password: hashedPassword, role: "user" },
    }),
    prisma.user.create({
      data: { name: "User 2", email: "user2@example.com", password: hashedPassword, role: "user" },
    }),
    prisma.user.create({
      data: { name: "User 3", email: "user3@example.com", password: hashedPassword, role: "user" },
    }),
    prisma.user.create({
      data: { name: "User 4", email: "user4@example.com", password: hashedPassword, role: "user" },
    }),
    prisma.user.create({
      data: { name: "User 5", email: "user5@example.com", password: hashedPassword, role: "user" },
    }),
  ]);

  console.log(`👥 Created ${users.length} users`);

  // Create 8 guitars from thesis sequentially to ensure ID/ranking order
  const guitarList = [
    {
      name: "Yamaha F310",
      brand: "Yamaha",
      type: "Akustik",
      bodyType: "Dreadnought",
      strings: "Phosphor Bronze",
      price: 1500000,
      priceRange: ">= Rp 1.250.000",
    },
    {
      name: "Yamaha C315",
      brand: "Yamaha",
      type: "Klasik",
      bodyType: "Standard",
      strings: "Nilon Tension Normal",
      price: 900000,
      priceRange: "Rp 750.000 – 999.999",
    },
    {
      name: "Cort AD810",
      brand: "Cort",
      type: "Akustik",
      bodyType: "Dreadnought",
      strings: "Phosphor Bronze",
      price: 1200000,
      priceRange: "Rp 1.000.000 – 1.249.999",
    },
    {
      name: "Cort AC-50",
      brand: "Cort",
      type: "Klasik",
      bodyType: "Standard",
      strings: "Nilon Tension Normal",
      price: 700000,
      priceRange: "<= Rp 749.999",
    },
    {
      name: "Anderson AF-12-N",
      brand: "Anderson",
      type: "Akustik",
      bodyType: "Concert/Grand",
      strings: "Phosphor Bronze",
      price: 600000,
      priceRange: "<= Rp 749.999",
    },
    {
      name: "Anderson AF-008 38",
      brand: "Anderson",
      type: "Akustik",
      bodyType: "Concert/Grand",
      strings: "Phosphor Bronze",
      price: 550000,
      priceRange: "<= Rp 749.999",
    },
    {
      name: "Yamaha C15",
      brand: "Yamaha",
      type: "Klasik",
      bodyType: "Narrow Nut Classical",
      strings: "Nilon Tension Normal",
      price: 800000,
      priceRange: "Rp 750.000 – 999.999",
    },
    {
      name: "Yamaha C370",
      brand: "Yamaha",
      type: "Klasik",
      bodyType: "Standard",
      strings: "Nilon Tension Normal",
      price: 1300000,
      priceRange: ">= Rp 1.250.000",
    },
  ];

  const guitars = [];
  for (const guitarData of guitarList) {
    const guitar = await prisma.guitar.create({
      data: guitarData,
    });
    guitars.push(guitar);
  }

  console.log(`🎸 Created ${guitars.length} guitars`);

  // Rating data from thesis (User 1-4 rate all guitars, User 5 only rates G1 and G2)
  // Format: [jenisGitar, bahanBody, jenisSenar, merek, harga]
  const ratingData = {
    // User 1 ratings
    1: {
      1: [5, 4, 2, 5, 2], // G1: Yamaha F310
      2: [3, 3, 5, 5, 5], // G2: Yamaha C315
      3: [3, 4, 3, 1, 1], // G3: Cort AD810
      4: [2, 3, 2, 1, 3], // G4: Cort AC-50
      5: [2, 2, 3, 1, 5], // G5: Anderson AF-12-N
      6: [2, 3, 3, 1, 5], // G6: Anderson AF-008 38
      7: [5, 5, 5, 5, 5], // G7: Yamaha C15
      8: [3, 4, 3, 5, 2], // G8: Yamaha C370
    },
    // User 2 ratings
    2: {
      1: [4, 4, 4, 4, 3], // G1
      2: [4, 5, 5, 2, 2], // G2
      3: [2, 3, 4, 4, 4], // G3
      4: [3, 3, 4, 3, 3], // G4
      5: [2, 5, 5, 4, 3], // G5
      6: [2, 4, 4, 4, 3], // G6
      7: [3, 4, 2, 4, 2], // G7
      8: [5, 4, 3, 4, 3], // G8
    },
    // User 3 ratings (all 4s - consistent rater)
    3: {
      1: [4, 4, 4, 4, 4],
      2: [4, 4, 4, 4, 4],
      3: [4, 4, 4, 4, 4],
      4: [4, 4, 4, 4, 4],
      5: [4, 4, 4, 4, 4],
      6: [4, 4, 4, 4, 4],
      7: [4, 4, 4, 4, 4],
      8: [4, 4, 4, 4, 4],
    },
    // User 4 ratings
    4: {
      1: [3, 2, 2, 4, 2], // G1
      2: [3, 2, 3, 3, 4], // G2
      3: [3, 2, 3, 2, 2], // G3
      4: [2, 2, 3, 2, 3], // G4
      5: [2, 2, 3, 2, 3], // G5
      6: [2, 2, 3, 1, 2], // G6
      7: [3, 2, 2, 3, 2], // G7
      8: [2, 2, 2, 4, 2], // G8
    },
    // User 5 ratings (only G1 and G2 - target user for recommendations)
    5: {
      1: [3, 3, 4, 4, 2], // G1
      2: [3, 3, 3, 4, 3], // G2
    },
  };

  // Create ratings
  let ratingCount = 0;
  for (const [userIndex, guitarRatings] of Object.entries(ratingData)) {
    const userId = users[parseInt(userIndex)].id; // +1 because admin is at index 0

    for (const [guitarIndex, ratings] of Object.entries(guitarRatings)) {
      const guitarId = guitars[parseInt(guitarIndex) - 1].id;
      const [jenisGitar, bahanBody, jenisSenar, merek, harga] = ratings;
      const averageRating = (jenisGitar + bahanBody + jenisSenar + merek + harga) / 5;

      await prisma.rating.create({
        data: {
          userId,
          guitarId,
          jenisGitar,
          bahanBody,
          jenisSenar,
          merek,
          harga,
          averageRating,
        },
      });
      ratingCount++;
    }
  }

  console.log(`⭐ Created ${ratingCount} ratings`);
  console.log("✅ Database seed completed!");
  console.log("\n📋 Test accounts:");
  console.log("   Admin: admin@example.com / password123");
  console.log("   User:  user1@example.com / password123");
  console.log("   User:  user5@example.com / password123 (for testing recommendations)");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
