import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { pool } from '../db';
import { AuthRequest } from '../middleware/auth';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../services/tokenService';
import { revokeRefreshToken, storeRefreshToken } from '../services/refreshTokenService';

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
      const accessToken = signAccessToken({
        id: user.id,
        username: user.username,
        role: user.role,
      });

      // リフレッシュトークン生成（オプション）
      const refreshToken = signRefreshToken({
        id: user.id
      });
      const ok = await storeRefreshToken(user.id, refreshToken);

      if (!ok) {
        return res.status(500).json({
          code: 'TOKEN_STORE_FAILED',
          message: 'トークン保存に失敗しました',
        });
      }
      res
        .status(200)
        .cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax', // CSRF対策
          path: '/api/auth',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
        })
        .json({
          accessToken,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
          },
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
router.post('/logout', async (req: AuthRequest, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  console.log('cookies:', req.cookies);
  if (!refreshToken) {
    return res.status(200).json({
      message: 'already logged out',
    });
  }
  
  try {
    const decoded = verifyRefreshToken(refreshToken);
    await revokeRefreshToken(decoded.id, refreshToken);
  } catch (err) {
    return res.status(400).json({
      code: 'INVALID_TOKEN',
      message: 'refresh token が無効です',
      timestamp: new Date().toISOString(),
    });
  }
  
  // トークンベースの認証では、クライアント側でトークンを削除
  return res
    .status(200)
    .clearCookie('refreshToken', {
      path: '/api/auth',
    })
    .json({ 
    message: 'ログアウトしました',
    timestamp: new Date().toISOString()
  });
});

// トークンリフレッシュ（オプション）
router.post(
  '/refresh',
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        code: 'BAD_REQUEST',
        message: 'リクエストが無効です',
        timestamp: new Date().toISOString()
      });
    }

    const refreshToken = req.cookies.refreshToken;

    let userId: number;
    try {
      const decoded = verifyRefreshToken(refreshToken);
      userId = decoded.id;
    } catch (err) {
      return res.status(401).json({
        code: 'INVALID_TOKEN',
        message: 'refresh token が無効です',
      });
    }

    // DB 校验 + revoke
    const ok = await revokeRefreshToken(userId, refreshToken);

    if (!ok) {
      return res.status(401).json({
        code: 'INVALID_TOKEN',
        message: 'refresh token が無効です',
      });
    }

    const userResult = await pool.query(
        'SELECT id, username, role FROM users WHERE id = $1',
        [userId]
    );
    const user = userResult.rows[0];
    if (!user) {
      return res.status(401).json({
        code: 'INVALID_TOKEN',
        message: 'ユーザーが存在しません',
      });
    }

    // === rotation ===
    const newAccessToken = signAccessToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    const newRefreshToken = signRefreshToken({
      id: user.id
    });

    const new_ok = await storeRefreshToken(user.id, newRefreshToken);

    if (!new_ok) {
      return res.status(500).json({
        code: 'TOKEN_STORE_FAILED',
        message: 'トークン保存に失敗しました',
      });
    }
    res
      .cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // CSRF対策
        path: '/api/auth',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        accessToken: newAccessToken,
      });
  }
);

export default router;