import { sql } from '../../lib/db.js';
import { requireAdmin, methodGuard } from '../../lib/auth.js';
import { generateLicenseKey } from '../../lib/key.js';

export default async function handler(req, res) {
  if (!methodGuard(req, res, ['POST'])) return;
  if (!requireAdmin(req, res)) return;

  const businessName = String(req.body?.businessName || '').trim();
  const plan = String(req.body?.plan || 'mensual').trim();
  const days = Number(req.body?.days || 30);
  const notes = String(req.body?.notes || '').trim();

  if (businessName.length < 2) return res.status(400).json({ error: 'Indique el nombre del negocio.' });
  if (!Number.isInteger(days) || days < 1 || days > 3650) return res.status(400).json({ error: 'Días de vigencia inválidos.' });

  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  for (let attempt = 0; attempt < 5; attempt++) {
    const licenseKey = generateLicenseKey();
    try {
      await sql`
        INSERT INTO licenses (license_key, business_name, plan, expires_at, notes)
        VALUES (${licenseKey}, ${businessName}, ${plan}, ${expiresAt}, ${notes});
      `;
      return res.status(201).json({ licenseKey, businessName, plan, expiresAt });
    } catch (error) {
      if (String(error.message).includes('duplicate key')) continue; // colisión extremadamente rara, reintenta
      return res.status(500).json({ error: error.message });
    }
  }
  return res.status(500).json({ error: 'No se pudo generar una clave única, intente de nuevo.' });
}
