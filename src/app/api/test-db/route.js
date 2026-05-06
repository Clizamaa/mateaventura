import { createPool } from 'mariadb'
import { ok } from '@/lib/api-handler'

export async function GET() {
  const connectionString = process.env.DATABASE_URL.replace('mysql://', 'mariadb://')
  const pool = createPool(connectionString + '?connectionLimit=1')
  
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT 1 as result");
    return ok({ success: true, result: rows[0].result });
  } catch (err) {
    return ok({ success: false, error: err.message }, 500);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}
