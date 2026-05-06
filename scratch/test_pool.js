import * as mariadb from 'mariadb'
import 'dotenv/config'

const url = new URL(process.env.DATABASE_URL)
const pool = mariadb.createPool({
  host: url.hostname,
  port: parseInt(url.port) || 3306,
  user: url.username,
  password: decodeURIComponent(url.password),
  database: url.pathname.substring(1),
  connectionLimit: 1
})

async function test() {
  let conn;
  try {
    console.log('Connecting to:', url.hostname)
    conn = await pool.getConnection();
    console.log('Connected!')
    const rows = await conn.query("SHOW TABLES");
    console.log('Tables:', rows);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

test();
