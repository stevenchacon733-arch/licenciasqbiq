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
