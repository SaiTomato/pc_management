import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db';

const router = express.Router();

// 簡易ログイン（Keycloak統合前の暫定実装）
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // 簡易認証（実際の実装ではKeycloakを使用）
  // ここではデモ用の簡易実装
  if (username === 'admin' && password === 'admin') {
    const token = jwt.sign(
      { id: '1', username: 'admin' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );
    return res.json({
      access_token: token,
      refresh_token: token, // 簡易実装
    });
  }

  res.status(401).json({ error: 'Invalid credentials' });
});

router.post('/logout', (req, res) => {
  // トークンベースの認証では、クライアント側でトークンを削除
  res.json({ message: 'Logged out successfully' });
});

export default router;
