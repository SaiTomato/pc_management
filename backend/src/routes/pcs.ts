import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { pool } from '../db';
import { authenticateToken, AuthRequest, requireAdmin } from '../middleware/auth';

const router = express.Router();

// すべてのルートで認証が必要
router.use(authenticateToken);

// PC一覧取得
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().isString().trim(),
  ],
  async (req: AuthRequest, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 'BAD_REQUEST',
        message: 'リクエストが無効です',
        errors: errors.array(),
        timestamp: new Date().toISOString(),
      });
    }

    const page = (req.query.page as any) || 1;
    const limit = (req.query.limit as any) || 10;
    const search = (req.query.search as string) || '';
    const offset = (page - 1) * limit;

    try {
      let query_str = 'SELECT id, name, username, usefor, place, status FROM pcs WHERE 1=1';
      const params: any[] = [];

      // 検索条件
      if (search) {
        query_str += ` AND (name ILIKE $${params.length + 1} OR username ILIKE $${params.length + 2} OR usefor ILIKE $${params.length + 3})`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      // 総数取得
      const countResult = await pool.query(
        query_str.replace('SELECT id, name, username, usefor, place, status', 'SELECT COUNT(*)'),
        params
      );
      const total = parseInt(countResult.rows[0].count, 10);

      // ページング
      query_str += ` ORDER BY id ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await pool.query(query_str, params);

      res.status(200).json({
        data: result.rows,
        total,
        page,
        limit,
      });
    } catch (err) {
      console.error('PC一覧取得エラー:', err);
      res.status(500).json({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'サーバーエラーが発生しました',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// PC詳細取得
router.get(
  '/:id',
  [param('id').isInt().toInt()],
  async (req: AuthRequest, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 'BAD_REQUEST',
        message: 'リクエストが無効です',
        errors: errors.array(),
        timestamp: new Date().toISOString(),
      });
    }

    const { id } = req.params;

    try {
      const result = await pool.query(
        `SELECT 
          id, name, manufacturer, model, serial_number, os, cpu, memory, storage,
          status, purchase_date, username, place, usefor, notes,
          created_at, updated_at
         FROM pcs WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          code: 'NOT_FOUND',
          message: 'リソースが見つかりません',
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('PC詳細取得エラー:', err);
      res.status(500).json({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'サーバーエラーが発生しました',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// PC登録
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('PC名が必要です').trim(),
    body('manufacturer').notEmpty().withMessage('製造元が必要です').trim(),
    body('model').notEmpty().withMessage('モデルが必要です').trim(),
    body('serial_number').optional().trim().custom(async (value) => {
      if (value) {
        const result = await pool.query('SELECT id FROM pcs WHERE serial_number = $1', [value]);
        if (result.rows.length > 0) {
          throw new Error('このシリアルナンバーは既に登録されています');
        }
      }
    }),
    body('status').optional().isIn(['active', 'inactive', 'maintenance']),
    body('place').optional().isIn(['office', 'worksite', 'remote']),
    body('purchase_date').optional().isISO8601(),
  ],
  async (req: AuthRequest, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 'BAD_REQUEST',
        message: 'リクエストが無効です',
        errors: errors.array(),
        timestamp: new Date().toISOString(),
      });
    }

    const {
      name, manufacturer, model, serial_number, os, cpu, memory, storage,
      status = 'inactive', purchase_date, username, place, usefor, notes
    } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO pcs 
         (name, manufacturer, model, serial_number, os, cpu, memory, storage, status, purchase_date, username, place, usefor, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING id, name, manufacturer, model, serial_number, os, cpu, memory, storage, status, purchase_date, username, place, usefor, notes, created_at, updated_at`,
        [name, manufacturer, model, serial_number, os, cpu, memory, storage, status, purchase_date, username, place, usefor, notes]
      );

      res.status(201).json(result.rows[0]);
    } catch (err: any) {
      console.error('PC登録エラー:', err);
      if (err.code === '23505') {
        // ユニーク制約違反
        return res.status(409).json({
          code: 'CONFLICT',
          message: 'このシリアルナンバーは既に登録されています',
          timestamp: new Date().toISOString(),
        });
      }
      res.status(500).json({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'サーバーエラーが発生しました',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// PC部分更新（PATCH）- 全員可能
router.patch(
  '/:id',
  [
    param('id').isInt().toInt(),
    body('status').optional().isIn(['active', 'inactive', 'maintenance']),
    body('username').optional().trim(),
    body('place').optional().isIn(['office', 'worksite', 'remote']),
    body('usefor').optional().trim(),
    // 禁止更新的字段验证 - 使用 if() 避免对不存在的字段验证
    body('purchase_date').if(body('purchase_date').exists()).custom(() => {
      throw new Error('purchase_date は PATCH では更新できません。PUT を使用してください');
    }),
    body('os').if(body('os').exists()).custom(() => {
      throw new Error('os は PATCH では更新できません。PUT を使用してください');
    }),
    body('cpu').if(body('cpu').exists()).custom(() => {
      throw new Error('cpu は PATCH では更新できません。PUT を使用してください');
    }),
    body('memory').if(body('memory').exists()).custom(() => {
      throw new Error('memory は PATCH では更新できません。PUT を使用してください');
    }),
    body('storage').if(body('storage').exists()).custom(() => {
      throw new Error('storage は PATCH では更新できません。PUT を使用してください');
    }),
    body('name').if(body('name').exists()).custom(() => {
      throw new Error('name は PATCH では更新できません。PUT を使用してください');
    }),
    body('manufacturer').if(body('manufacturer').exists()).custom(() => {
      throw new Error('manufacturer は PATCH では更新できません。PUT を使用してください');
    }),
    body('model').if(body('model').exists()).custom(() => {
      throw new Error('model は PATCH では更新できません。PUT を使用してください');
    }),
    body('serial_number').if(body('serial_number').exists()).custom(() => {
      throw new Error('serial_number は PATCH では更新できません。PUT を使用してください');
    }),
    body('notes').if(body('notes').exists()).custom(() => {
      throw new Error('notes は PATCH では更新できません。PUT を使用してください');
    }),
  ],
  async (req: AuthRequest, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 'BAD_REQUEST',
        message: 'リクエストが無効です',
        errors: errors.array(),
        timestamp: new Date().toISOString(),
      });
    }

    const { id } = req.params;

    try {
      const pcResult = await pool.query('SELECT id FROM pcs WHERE id = $1', [id]);
      if (pcResult.rows.length === 0) {
        return res.status(404).json({
          code: 'NOT_FOUND',
          message: 'リソースが見つかりません',
          timestamp: new Date().toISOString(),
        });
      }

      const updates: string[] = [];
      const params: any[] = [];
      let paramCount = 1;

      // const allowedFields = ['status', 'username', 'place', 'usefor'];

      // allowedFields.forEach((field) => {
      //   if (req.body[field] !== undefined) {
      //     updates.push(`${field} = $${paramCount}`);
      //     params.push(req.body[field]);
      //     paramCount++;
      //   }
      // });
      const fieldMap: Record<string, string> = {
        status: 'status',
        username: 'username',
        place: 'place',
        usefor: 'usefor',
      };

      Object.keys(fieldMap).forEach((apiField) => {
        if (req.body[apiField] !== undefined) {
          updates.push(`${fieldMap[apiField]} = $${paramCount}`);
          params.push(req.body[apiField]);
          paramCount++;
        }
      });

      if (updates.length === 0) {
        return res.status(400).json({
          code: 'BAD_REQUEST',
          message: '更新するフィールドが指定されていません',
          timestamp: new Date().toISOString(),
        });
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      params.push(id);

      const result = await pool.query(
        `UPDATE pcs SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        params
      );

      res.status(200).json(result.rows[0]);
    } catch (err: any) {
      console.error('PC更新エラー:', err);
      res.status(500).json({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'サーバーエラーが発生しました',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// PC完全更新（PUT）- 管理者専用
router.put(
  '/:id',
  [
    param('id').isInt().toInt(),
    body('name').notEmpty().withMessage('PC名が必要です').trim(),
    body('manufacturer').notEmpty().withMessage('製造元が必要です').trim(),
    body('model').notEmpty().withMessage('モデルが必要です').trim(),
    body('serial_number').optional().trim().custom(async (value, { req }) => {
      if (value) {
        const result = await pool.query(
          'SELECT id FROM pcs WHERE serial_number = $1 AND id != $2',
          [value, (req as any).params.id]
        );
        if (result.rows.length > 0) {
          throw new Error('このシリアルナンバーは既に登録されています');
        }
      }
    }),
    body('status').optional().isIn(['active', 'inactive', 'maintenance']),
    body('place').optional().isIn(['office', 'worksite', 'remote']),
    body('purchase_date').optional().isISO8601(),
  ],
  requireAdmin,
  async (req: AuthRequest, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 'BAD_REQUEST',
        message: 'リクエストが無効です',
        errors: errors.array(),
        timestamp: new Date().toISOString(),
      });
    }

    const { id } = req.params;
    const {
      name, manufacturer, model, serial_number, os, cpu, memory, storage,
      status = 'inactive', purchase_date, username, place, usefor, notes
    } = req.body;

    try {
      // PC存在確認
      const pcResult = await pool.query('SELECT id FROM pcs WHERE id = $1', [id]);
      if (pcResult.rows.length === 0) {
        return res.status(404).json({
          code: 'NOT_FOUND',
          message: 'リソースが見つかりません',
          timestamp: new Date().toISOString(),
        });
      }

      const result = await pool.query(
        `UPDATE pcs SET 
         name = $1, manufacturer = $2, model = $3, serial_number = $4, os = $5, cpu = $6, memory = $7, storage = $8,
         status = $9, purchase_date = $10, username = $11, place = $12, usefor = $13, notes = $14, updated_at = CURRENT_TIMESTAMP
         WHERE id = $15
         RETURNING *`,
        [name, manufacturer, model, serial_number, os, cpu, memory, storage, status, purchase_date, username, place, usefor, notes, id]
      );

      res.status(200).json(result.rows[0]);
    } catch (err: any) {
      console.error('PC詳細更新エラー:', err);
      if (err.code === '23505') {
        return res.status(409).json({
          code: 'CONFLICT',
          message: 'このシリアルナンバーは既に登録されています',
          timestamp: new Date().toISOString(),
        });
      }
      res.status(500).json({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'サーバーエラーが発生しました',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// PC削除 - 管理者専用
router.delete(
  '/:id',
  [param('id').isInt().toInt()],
  requireAdmin,
  async (req: AuthRequest, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 'BAD_REQUEST',
        message: 'リクエストが無効です',
        errors: errors.array(),
        timestamp: new Date().toISOString(),
      });
    }

    const { id } = req.params;

    try {
      const result = await pool.query('DELETE FROM pcs WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          code: 'NOT_FOUND',
          message: 'リソースが見つかりません',
          timestamp: new Date().toISOString(),
        });
      }

      res.status(204).send();
    } catch (err) {
      console.error('PC削除エラー:', err);
      res.status(500).json({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'サーバーエラーが発生しました',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

export default router;