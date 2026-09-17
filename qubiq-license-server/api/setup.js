import { ensureSchema } from '../lib/db.js';
import { requireAdmin, methodGuard } from '../lib/auth.js';

export default async function handler(req, res) {
  if (!methodGuard(req, res, ['POST'])) return;
  if (!requireAdmin(req, res)) return;
  try {
    await ensureSchema();
    res.status(200).json({ ok: true, message: 'Base de datos lista.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
