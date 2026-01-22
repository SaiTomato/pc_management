import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// テーブル作成と初期化
export const initDatabase = async () => {
  const client = await pool.connect();
  try {
    // users テーブル作成
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // pcs テーブル作成
    await client.query(`
      CREATE TABLE IF NOT EXISTS pcs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        manufacturer VARCHAR(255) NOT NULL,
        model VARCHAR(255) NOT NULL,
        serial_number VARCHAR(255) UNIQUE,
        os VARCHAR(255),
        cpu VARCHAR(255),
        memory VARCHAR(255),
        storage VARCHAR(255),
        status VARCHAR(50) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'maintenance')),
        purchase_date DATE,
        username VARCHAR(255),
        place VARCHAR(50) CHECK (place IN ('office', 'worksite', 'remote')),
        usefor VARCHAR(500),
        notes VARCHAR(1000),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (username) REFERENCES users(username) ON DELETE SET NULL
      );
    `);

    // 初期管理者ユーザーの作成（既に存在しない場合）
    const adminExists = await client.query(
      'SELECT id FROM users WHERE username = $1',
      ['admin']
    );

    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query(
        'INSERT INTO users (username, password, email, role) VALUES ($1, $2, $3, $4)',
        ['admin', hashedPassword, 'admin@example.com', 'admin']
      );
      console.log('✓ 初期管理者ユーザーを作成しました (username: admin)');
    }

    console.log('✓ データベース初期化完了');
  } catch (err) {
    console.error('✗ データベース初期化エラー:', err);
    throw err;
  } finally {
    client.release();
  }
};

// データベース接続テスト
export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✓ データベース接続成功:', result.rows[0]);
  } catch (err) {
    console.error('✗ データベース接続エラー:', err);
    throw err;
  }
};