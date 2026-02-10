import { withTransaction } from "./pool.js";
import { hashPassword } from "@/lib/crypto.js";

const ADMIN_NAME = process.env.ADMIN_NAME || "Admin User";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Seed default admin user
const seedAdmin = async () => {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      [ADMIN_EMAIL],
    );

    if (rows.length > 0) {
      console.log("Admin already exists, skipping seeding.");
      return;
    }

    const passwordHash = await hashPassword(ADMIN_PASSWORD);

    await client.query(
      `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, 'ADMIN')
      `,
      [ADMIN_NAME, ADMIN_EMAIL, passwordHash],
    );

    console.log("pass: ", ADMIN_PASSWORD);
    

    console.log("Admin user seeded successfully");
  });
};

// run seeders
const runSeeds = async () => {
  try {
    await seedAdmin();
  } catch (err) {
    console.error("Seeding failed", {
      message: err.message,
      code: err.code,
    });
    process.exit(1);
  }
};

export default runSeeds;
