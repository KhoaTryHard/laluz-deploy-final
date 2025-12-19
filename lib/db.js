import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query({ query, values = [] }) {
  const dbconnection = await pool.getConnection();
  try {
    const [results] = await dbconnection.execute(query, values);
    dbconnection.release();
    return results;
  } catch (error) {
    dbconnection.release(); // Luôn giải phóng kết nối nếu có lỗi
    throw error;
  }
}