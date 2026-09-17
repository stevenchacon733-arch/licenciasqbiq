// Vercel a veces obliga a poner un prefijo (ej. "STORAGE") al conectar la base de datos,
// lo que crea variables como STORAGE_POSTGRES_URL en vez de POSTGRES_URL. @vercel/postgres
// solo busca POSTGRES_URL por defecto, así que la detectamos nosotros mismos y la copiamos
// antes de que se use, sin importar qué prefijo haya puesto Vercel.
if (!process.env.POSTGRES_URL) {
  const candidateKey = Object.keys(process.env).find(
    (key) => /POSTGRES_URL$/.test(key) && !/PRISMA|NON_POOLING/.test(key)
  ) || Object.keys(process.env).find((key) => /POSTGRES_URL_NON_POOLING$/.test(key));
  if (candidateKey) {
    process.env.POSTGRES_URL = process.env[candidateKey];
  }
}

import { sql } from '@vercel/postgres';

export { sql };

export async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS licenses (
      id SERIAL PRIMARY KEY,
      license_key TEXT UNIQUE NOT NULL,
      business_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
      machine_id TEXT,
      plan TEXT NOT NULL DEFAULT 'mensual',
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_check_at TIMESTAMPTZ,
      last_check_ip TEXT,
      notes TEXT NOT NULL DEFAULT ''
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(license_key);`;
}
