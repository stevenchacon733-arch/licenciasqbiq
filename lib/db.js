import postgres from 'postgres';

// Detecta la URL de conexión de Supabase sin importar el prefijo que Vercel haya usado.
// Preferimos la NON_POOLING para conexiones directas; si no, cualquier POSTGRES_URL.
function resolveConnectionString() {
  const env = process.env;
  const direct =
    env.POSTGRES_URL_NON_POOLING ||
    env.POSTGRES_URL ||
    Object.keys(env).map((k) => (/POSTGRES_URL_NON_POOLING$/.test(k) ? env[k] : null)).find(Boolean) ||
    Object.keys(env).map((k) => (/POSTGRES_URL$/.test(k) && !/PRISMA/.test(k) ? env[k] : null)).find(Boolean);
  return direct;
}

const connectionString = resolveConnectionString();

// prepare:false es necesario para el connection pooler de Supabase (Supavisor).
const client = connectionString
  ? postgres(connectionString, { ssl: 'require', prepare: false })
  : null;

// Emula la etiqueta sql`...` de @vercel/postgres para no cambiar el resto del código.
export async function sql(strings, ...values) {
  if (!client) throw new Error('No hay cadena de conexión a la base de datos configurada.');
  const result = await client(strings, ...values);
  return { rows: Array.from(result), rowCount: result.count };
}

export async function ensureSchema() {
  if (!client) throw new Error('No hay cadena de conexión a la base de datos configurada.');
  await client`
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
  await client`CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(license_key);`;
}
