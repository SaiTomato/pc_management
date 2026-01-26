import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

// トークン検証とユーザー情報の抽出
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      code: 'UNAUTHORIZED',
      message: 'アクセストークンが必要です',
      timestamp: new Date().toISOString()
    });
  }

  jwt.verify(token, process.env.JWT_SECRET_ACCESS!, (err: any, user: any) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          code: 'TOKEN_EXPIRED',
          message: 'アクセストークンの有効期限が切れています',
        });
      }

      return res.status(401).json({
        code: 'INVALID_TOKEN',
        message: 'トークンが無効です',
      });
    }
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };
    next();
  });
};

// 管理者権限チェック
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: '認証が必要です',
      timestamp: new Date().toISOString(),
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      code: 'FORBIDDEN',
      message: 'このアクションを実行する権限がありません',
      timestamp: new Date().toISOString(),
    });
  }

  next();
};