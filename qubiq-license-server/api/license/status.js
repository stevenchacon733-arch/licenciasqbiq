import { sql } from '../../lib/db.js';
import { requireAdmin, methodGuard } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (!methodGuard(req, res, ['POST'])) return;
  if (!requireAdmin(req, res)) return;

  const licenseKey = String(req.body?.licenseKey || '').trim().toUpperCase();
  const status = String(req.body?.status || '').trim();
  if (!licenseKey) return res.status(400).json({ error: 'Falta la clave de licencia.' });
  if (!['active', 'suspended'].includes(status)) return res.status(400).json({ error: 'Estado inválido.' });

  const result = await sql`UPDATE licenses SET status = ${status} WHERE license_key = ${licenseKey};`;
  if (!result.rowCount) return res.status(404).json({ error: 'Licencia no encontrada.' });
  res.status(200).json({ ok: true });
}
