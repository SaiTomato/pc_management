import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// トークンブラックリスト（ログアウト用）
const tokenBlacklist = new Set<string>();

export interface AuthRequest extends Request {
  userId?: number;
  username?: string;
  role?: string;
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

  // ブラックリストチェック
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ 
      code: 'TOKEN_REVOKED',
      message: 'トークンは無効化されています',
      timestamp: new Date().toISOString()
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {
    if (err) {
      return res.status(401).json({ 
        code: 'INVALID_TOKEN',
        message: 'トークンが無効です',
        timestamp: new Date().toISOString()
      });
    }
    req.userId = user.id;
    req.username = user.username;
    req.role = user.role;
    next();
  });
};

// 管理者権限チェック
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ 
      code: 'FORBIDDEN',
      message: 'このアクションを実行する権限がありません',
      timestamp: new Date().toISOString()
    });
  }
  next();
};

// Token を黑名单に追加（ログアウト用）
export const revokeToken = (token: string) => {
  tokenBlacklist.add(token);
};

// Token が有効か確認
export const isTokenBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};

// PC所有者またはエラーハンドリング用のチェック
export const checkPCOwnerOrAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  // PATCH操作の場合、所有者または管理者
  // PUT操作の場合、管理者のみ（requireAdminで別途チェック）
  next();
};