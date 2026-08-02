import { Pool } from 'pg';

const DB_URL = process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')
  ? process.env.DATABASE_URL
  : 'postgresql://postgres:2ce556078d9466fd424499d31b67e3b6@3kgi95g9.ap-southeast.database.insforge.app:5432/insforge?sslmode=require';

const pool = new Pool({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 15000,
});

pool.on('error', (err) => console.error('DB pool error', err.message));

export default pool;

export async function query(text: string, params?: any[]) {
  const res = await pool.query(text, params);
  return res;
}
