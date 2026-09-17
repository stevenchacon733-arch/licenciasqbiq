import { sql } from '../../lib/db.js';
import { requireAdmin, methodGuard } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (!methodGuard(req, res, ['GET'])) return;
  if (!requireAdmin(req, res)) return;

  try {
    const result = await sql`SELECT * FROM licenses ORDER BY created_at DESC;`;
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
