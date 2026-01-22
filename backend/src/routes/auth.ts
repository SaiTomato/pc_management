import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { pool } from '../db';
import { authenticateToken, AuthRequest, revokeToken } from '../middleware/auth';

const router = express.Router();

// ログイン
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('ユーザー名が必要です'),
    body('password').notEmpty().withMessage('パスワードが必要です'),
  ],
  async (req: Request, res: Response) => {
    // バリデーションエラーチェック
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        code: 'BAD_REQUEST',
        message: 'リクエストが無効です',
        errors: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    const { username, password } = req.body;

    try {
      // ユーザーを検索
      const userResult = await pool.query(
        'SELECT id, username, password, role FROM users WHERE username = $1',
        [username]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ 
          code: 'INVALID_CREDENTIALS',
          message: '認証に失敗しました',
          timestamp: new Date().toISOString()
        });
      }

      const user = userResult.rows[0];

      // パスワード検証
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ 
          code: 'INVALID_CREDENTIALS',
          message: '認証に失敗しました',
          timestamp: new Date().toISOString()
        });
      }

      // JWTトークン生成
      const expiresIn = 3600; // 1時間
      const accessToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn }
      );

      // リフレッシュトークン生成（オプション）
      const refreshToken = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      res.status(200).json({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: expiresIn,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    } catch (err) {
      console.error('ログインエラー:', err);
      res.status(500).json({ 
        code: 'INTERNAL_SERVER_ERROR',
        message: 'サーバーエラーが発生しました',
        timestamp: new Date().toISOString()
      });
    }
  }
);

// ログアウト
router.post('/logout', (req: AuthRequest, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    revokeToken(token);
  }
  
  // トークンベースの認証では、クライアント側でトークンを削除
  res.status(200).json({ 
    message: 'ログアウトしました',
    timestamp: new Date().toISOString()
  });
});

// トークンリフレッシュ（オプション）
router.post(
  '/refresh',
  [body('refresh_token').notEmpty().withMessage('リフレッシュトークンが必要です')],
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        code: 'BAD_REQUEST',
        message: 'リクエストが無効です',
        timestamp: new Date().toISOString()
      });
    }

    const { refresh_token } = req.body;

    try {
      const decoded: any = jwt.verify(refresh_token, process.env.JWT_SECRET || 'secret');
      const expiresIn = 3600;
      const newAccessToken = jwt.sign(
        { id: decoded.id, username: decoded.username },
        process.env.JWT_SECRET || 'secret',
        { expiresIn }
      );

      res.status(200).json({
        access_token: newAccessToken,
        expires_in: expiresIn
      });
    } catch (err) {
      return res.status(401).json({ 
        code: 'INVALID_TOKEN',
        message: 'リフレッシュトークンが無効です',
        timestamp: new Date().toISOString()
      });
    }
  }
);

export default router;