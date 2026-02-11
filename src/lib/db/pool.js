import { Pool } from "pg";

let pool;

const getPool = () => {
  if (!pool) {
    if (process.env.NEXT_PHASE === 'phase-production-build' || !process.env.DATABASE_URL) {
      throw new Error('Database not available during build');
    }
    
    // Check if we need to enforce SSL (Common for Neon/Supabase/AWS)
    const isExternal = process.env.DATABASE_URL.includes("neon.tech") || 
                       process.env.DATABASE_URL.includes("supabase") ||
                       process.env.DATABASE_URL.includes("render.com");

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      // Increased to 10s to handle cold starts and campus network lag
      connectionTimeoutMillis: 10000, 
      ssl: isExternal ? { rejectUnauthorized: false } : false,
    });

    pool.on("connect", () => {
      console.log("Database connection established");
    });

    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
      // Don't exit in Next.js dev mode as it kills the hot-reload server
      if (process.env.NODE_ENV !== "development") {
        process.exit(1);
      }
    });
  }

  return pool;
};

const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const res = await getPool().query({
      text,
      values: params,
      // Increased slightly to allow for complex queries
      statement_timeout: 10000,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("DB query", {
        duration: `${Date.now() - start}ms`,
        rows: res.rowCount,
      });
    }

    return res;
  } catch (err) {
    console.error("Database query error", {
      message: err.message,
      code: err.code,
    });
    throw err;
  }
};

const withClient = async (fn) => {
  const client = await getPool().connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
};

const withTransaction = async (fn) => {
  return withClient(async (client) => {
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }
  });
};

const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

export { getPool, query, withClient, withTransaction, closePool };