import express from 'express';
import { pool } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// すべてのルートで認証が必要
router.use(authenticateToken);

// PC一覧取得
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM pcs';
    let countQuery = 'SELECT COUNT(*) FROM pcs';
    const params: any[] = [];
    const conditions: string[] = [];

    if (search) {
      conditions.push(`(name ILIKE $1 OR manufacturer ILIKE $1 OR model ILIKE $1)`);
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, search ? [params[0]] : [])
    ]);

    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching PCs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PC詳細取得
router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM pcs WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'PC not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching PC:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PC登録
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('manufacturer').notEmpty().withMessage('Manufacturer is required'),
    body('model').notEmpty().withMessage('Model is required'),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        name,
        manufacturer,
        model,
        serialNumber,
        os,
        cpu,
        memory,
        storage,
        status,
        purchaseDate,
        notes,
      } = req.body;

      const result = await pool.query(
        `INSERT INTO pcs (name, manufacturer, model, serial_number, os, cpu, memory, storage, status, purchase_date, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [name, manufacturer, model, serialNumber || null, os || null, cpu || null, memory || null, storage || null, status || 'active', purchaseDate || null, notes || null]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating PC:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// PC更新
router.put(
  '/:id',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('manufacturer').notEmpty().withMessage('Manufacturer is required'),
    body('model').notEmpty().withMessage('Model is required'),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const {
        name,
        manufacturer,
        model,
        serialNumber,
        os,
        cpu,
        memory,
        storage,
        status,
        purchaseDate,
        notes,
      } = req.body;

      const result = await pool.query(
        `UPDATE pcs 
         SET name = $1, manufacturer = $2, model = $3, serial_number = $4, os = $5, cpu = $6, memory = $7, storage = $8, status = $9, purchase_date = $10, notes = $11, updated_at = CURRENT_TIMESTAMP
         WHERE id = $12
         RETURNING *`,
        [name, manufacturer, model, serialNumber || null, os || null, cpu || null, memory || null, storage || null, status || 'active', purchaseDate || null, notes || null, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'PC not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating PC:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// PC削除
router.delete('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM pcs WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'PC not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting PC:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
