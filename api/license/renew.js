import { sql } from '../../lib/db.js';
import { requireAdmin, methodGuard } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (!methodGuard(req, res, ['POST'])) return;
  if (!requireAdmin(req, res)) return;

  const licenseKey = String(req.body?.licenseKey || '').trim().toUpperCase();
  const days = Number(req.body?.days || 30);
  if (!licenseKey) return res.status(400).json({ error: 'Falta la clave de licencia.' });
  if (!Number.isInteger(days) || days < 1 || days > 3650) return res.status(400).json({ error: 'Días de renovación inválidos.' });

  const result = await sql`SELECT expires_at FROM licenses WHERE license_key = ${licenseKey} LIMIT 1;`;
  const row = result.rows[0];
  if (!row) return res.status(404).json({ error: 'Licencia no encontrada.' });

  // Si ya venció, la renovación cuenta desde hoy; si sigue vigente, se suma al vencimiento actual.
  const base = new Date(row.expires_at) > new Date() ? new Date(row.expires_at) : new Date();
  const expiresAt = new Date(base.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

  await sql`UPDATE licenses SET expires_at = ${expiresAt}, status = 'active' WHERE license_key = ${licenseKey};`;
  res.status(200).json({ ok: true, expiresAt });
}
