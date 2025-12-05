import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: 'localhost',      // Địa chỉ MySQL server
  user: 'root',           // Username MySQL
  password: '',       // Mật khẩu MySQL
  database: 'starShop',   // Tên database
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function queryDatabase(sql: string, values?: any[]) {
  try {
    const connection = await pool.getConnection();
    const [results] = await (connection as any).execute(sql, values);
    connection.release();
    return results;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}
