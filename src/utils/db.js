import mysql from 'mysql2/promise';

let pool;

export async function getConnection() {
    try {
        if (!pool) {
            pool = mysql.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                // waitForConnections: true,
                // connectionLimit: 1000,
                // queueLimit: 0
            });
        }

        const connection = await pool.getConnection();
        return connection;
    } catch (error) {
        console.error('Failed to establish a database connection:', error);
        throw error;
    }
}