import { Pool } from "pg";

let pool;

// Get or create the database connection pool
const getPool = () => {
  if (!pool) {
    // Skip database connection during build
    if (process.env.NEXT_PHASE === 'phase-production-build' || !process.env.DATABASE_URL) {
      throw new Error('Database not available during build');
    }
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on("connect", () => {
      console.log("Database connection established");
    });


    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
      process.exit(1);
    });
  }

  return pool;
};

// Execute a query with parameters
const query = async (text, params = []) => {
  const start = Date.now();

  try {
    const res = await getPool().query({
      text,
      values: params,
      statement_timeout: 5000,
    });

    // Log query details in development
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

// run multiple operations with a single client
const withClient = async (fn) => {
  const client = await getPool().connect();

  try {
    return await fn(client);
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

// run transaction safely
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

// Close the pool
const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

export { getPool, query, withClient, withTransaction, closePool };
