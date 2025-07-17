import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // Use proper SSL configuration
    rejectUnauthorized: process.env.NODE_ENV === 'production',
    ca: process.env.DATABASE_SSL_CERT // Optional: provide CA certificate
  },
});

// Add global error handler for pool
pool.on('error', (err) => {
  console.error('Unexpected database error', err);
});

export async function sql(queryStrings, ...values) {
  const client = await pool.connect();
  try {
    let text = "";
    queryStrings.forEach((str, i) => {
      text += str + (values[i] !== undefined ? values[i] : "");
    });
    const result = await client.query(text);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error; // Re-throw to allow caller to handle
  } finally {
    client.release();
  }
}
