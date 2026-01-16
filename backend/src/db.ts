import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// テーブル作成
export const initDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS pcs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        manufacturer VARCHAR(255) NOT NULL,
        model VARCHAR(255) NOT NULL,
        serial_number VARCHAR(255),
        os VARCHAR(255),
        cpu VARCHAR(255),
        memory VARCHAR(255),
        storage VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        purchase_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database tables initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  } finally {
    client.release();
  }
};
