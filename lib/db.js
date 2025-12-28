import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // ❌ KHÔNG ssl khi dùng switchback.proxy.rlwy.net
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query({ query, values = [] }) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(query, values);
    return rows;
  } finally {
    conn.release();
  }
}
