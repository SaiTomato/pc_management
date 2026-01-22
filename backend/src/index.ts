import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { pool, initDatabase, testConnection } from './db';
import authRoutes from './routes/auth';
import pcRoutes from './routes/pcs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア
app.use(cors());
app.use(express.json());

// リクエストログ
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// ルート
app.use('/api/auth', authRoutes);
app.use('/api/pcs', pcRoutes);

// 404 ハンドラ
app.use((req, res) => {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: 'エンドポイントが見つかりません',
    path: req.path,
    timestamp: new Date().toISOString(),
  });
});

// グローバルエラーハンドリング
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('エラー:', err);

  // デフォルトエラー
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'サーバーエラーが発生しました';

  // JSON パースエラー
  if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'リクエストボディが無効な JSON です';
  }

  // CORS エラー
  if (err.message && err.message.includes('CORS')) {
    statusCode = 403;
    code = 'CORS_ERROR';
    message = 'CORS エラーが発生しました';
  }

  res.status(statusCode).json({
    code,
    message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// データベース接続確認と初期化
pool
  .connect()
  .then(async (client) => {
    client.release();
    await testConnection();
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ API documentation: http://localhost:${PORT}/api/docs`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch((err) => {
    console.error('✗ Database connection failed:', err);
    process.exit(1);
  });

export default app;