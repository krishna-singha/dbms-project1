import { readFileSync } from "fs";
import { join } from "path";
import { query, withTransaction } from "./pool.js";

// Check if database is initialized
const isDatabaseInitialized = async () => {
  try {
    const { rows } = await query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `);

    return rows[0].exists;
  } catch (err) {
    console.error("Error checking database initialization", {
      message: err.message,
      code: err.code,
    });
    return false;
  }
};

// Initialize database by executing db.sql
const initializeDatabase = async () => {
  const sqlPath = join(process.cwd(), "src/lib/db/db.sql");
  const sql = readFileSync(sqlPath, "utf8");

  return withTransaction(async (client) => {
    try {
      await client.query(sql);

      console.log("Database initialized successfully");
      return true;
    } catch (err) {
      console.error("Error initializing database", {
        message: err.message,
        code: err.code,
      });
      throw err;
    }
  });
};

// Drop all tables and enums
const dropAllTables = async () => {
  return withTransaction(async (client) => {
    try {
      await client.query(`
        DROP TABLE IF EXISTS
          enrollments,
          teaches,
          course_topics,
          contents,
          courses,
          topics,
          textbooks,
          partner_university,
          instructors,
          students,
          users
        CASCADE;

        DROP TYPE IF EXISTS
          content_enum,
          program_enum,
          role_enum
        CASCADE;
      `);

      console.log("All tables and enums dropped successfully");
      return true;
    } catch (err) {
      console.error("Error dropping tables", {
        message: err.message,
        code: err.code,
      });
      throw err;
    }
  });
};

// Reset database (drop + re-init)
const resetDatabase = async () => {
  await dropAllTables();
  await initializeDatabase();
};

export {
  isDatabaseInitialized,
  initializeDatabase,
  dropAllTables,
  resetDatabase,
};
