import { pool } from '../db';
import { hashToken } from '../utils/tokenHash';

export async function storeRefreshToken(
  userId: number,
  refreshToken: string
) : Promise<boolean> {
  try {
    const tokenHash = hashToken(refreshToken);

    const result = await pool.query(
      `
      INSERT INTO refreshTokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '7 days')
      `,
      [userId, tokenHash]
    );

    return result.rowCount === 1;
  } catch (err) {
    console.error('storeRefreshToken error:', err);
    return false;
  }
}

export async function revokeRefreshToken(
  userId: number,
  refreshToken: string
): Promise<boolean> {
  const tokenHash = hashToken(refreshToken);

  const result = await pool.query(
    `
    UPDATE refreshTokens
    SET revoked = TRUE
    WHERE user_id = $1
      AND token_hash = $2
      AND revoked = FALSE
      AND expires_at > NOW()
    RETURNING id
    `,
    [userId, tokenHash]
  );

  return (result.rowCount ?? 0) > 0;
}