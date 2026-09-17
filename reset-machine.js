import { sql } from '../../lib/db.js';
import { requireAdmin, methodGuard } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (!methodGuard(req, res, ['POST'])) return;
  if (!requireAdmin(req, res)) return;

  const licenseKey = String(req.body?.licenseKey || '').trim().toUpperCase();
  if (!licenseKey) return res.status(400).json({ error: 'Falta la clave de licencia.' });

  const result = await sql`UPDATE licenses SET machine_id = NULL WHERE license_key = ${licenseKey};`;
  if (!result.rowCount) return res.status(404).json({ error: 'Licencia no encontrada.' });
  res.status(200).json({ ok: true });
}
