export function requireAdmin(req, res) {
  const provided = req.headers['x-admin-secret'];
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    res.status(500).json({ error: 'ADMIN_SECRET no está configurado en el servidor.' });
    return false;
  }
  if (!provided || provided !== expected) {
    res.status(401).json({ error: 'No autorizado.' });
    return false;
  }
  return true;
}

export function methodGuard(req, res, allowed) {
  if (!allowed.includes(req.method)) {
    res.setHeader('Allow', allowed.join(', '));
    res.status(405).json({ error: `Método no permitido. Use ${allowed.join(' o ')}.` });
    return false;
  }
  return true;
}
