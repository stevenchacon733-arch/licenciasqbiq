import { sql } from '../../lib/db.js';
import { methodGuard } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (!methodGuard(req, res, ['POST'])) return;

  const licenseKey = String(req.body?.licenseKey || '').trim().toUpperCase();
  const machineId = String(req.body?.machineId || '').trim();
  if (!licenseKey || !machineId) {
    return res.status(400).json({ valid: false, message: 'Falta la clave de licencia o el identificador de equipo.' });
  }

  let row;
  try {
    const result = await sql`SELECT * FROM licenses WHERE license_key = ${licenseKey} LIMIT 1;`;
    row = result.rows[0];
  } catch (error) {
    // Si el servidor de licencias no responde bien, el cliente (license.js) ya está diseñado
    // para seguir operando en modo de gracia — así que devolvemos 500 sin filtrar detalles internos.
    return res.status(500).json({ valid: false, message: 'No se pudo verificar la licencia en este momento.' });
  }

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  const now = new Date();

  if (!row) {
    return res.status(200).json({ valid: false, message: 'Clave de licencia no encontrada.' });
  }
  if (row.status === 'suspended') {
    return res.status(200).json({ valid: false, expiresAt: row.expires_at, message: 'Licencia suspendida. Contactá a Qubiq.' });
  }
  if (row.machine_id && row.machine_id !== machineId) {
    return res.status(200).json({ valid: false, message: 'Esta licencia ya está activada en otro equipo. Contactá a Qubiq para reasignarla.' });
  }

  // Primera activación: la clave queda ligada a este equipo.
  if (!row.machine_id) {
    await sql`UPDATE licenses SET machine_id = ${machineId}, last_check_at = ${now.toISOString()}, last_check_ip = ${ip} WHERE license_key = ${licenseKey};`;
  } else {
    await sql`UPDATE licenses SET last_check_at = ${now.toISOString()}, last_check_ip = ${ip} WHERE license_key = ${licenseKey};`;
  }

  const expired = new Date(row.expires_at) < now;
  if (expired) {
    return res.status(200).json({ valid: false, expiresAt: row.expires_at, message: 'La suscripción venció. Renovala para seguir usando Qubiq Control.' });
  }

  return res.status(200).json({ valid: true, expiresAt: row.expires_at, message: 'Licencia activa.' });
}
