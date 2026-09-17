# Qubiq License Server

Servidor de verificación de licencias para Qubiq Control. Cada instalación de Qubiq
Control en un negocio consulta este servidor periódicamente (`POST /api/license/verify`)
para confirmar que la suscripción está al día.

## 1. Subir a GitHub

```
cd qubiq-license-server
git init
git add .
git commit -m "Servidor de licencias inicial"
```

Creá un repositorio nuevo en GitHub (por ejemplo `qubiq-license-server`) y subí el código:

```
git remote add origin https://github.com/TU_USUARIO/qubiq-license-server.git
git branch -M main
git push -u origin main
```

## 2. Importar en Vercel

1. Entrá a [vercel.com](https://vercel.com) → **Add New → Project**.
2. Elegí el repositorio `qubiq-license-server`.
3. Framework Preset: dejalo en **Other** (no hace falta build, son funciones serverless puras).
4. Dale **Deploy**. La primera vez va a fallar la conexión a base de datos — es normal, todavía no existe. Seguí al paso 3.

## 3. Crear la base de datos

1. Dentro del proyecto en Vercel, andá a la pestaña **Storage → Create Database → Postgres**.
2. Conectala al proyecto (Vercel llena automáticamente la variable `POSTGRES_URL`).

## 4. Configurar tu clave de administrador

1. **Settings → Environment Variables** → agregá `ADMIN_SECRET` con un valor largo y aleatorio
   (podés generarlo con `openssl rand -hex 32` en una terminal, o cualquier generador de contraseñas).
2. Redesployá el proyecto (**Deployments → ⋯ → Redeploy**) para que tome la variable nueva.

## 5. Inicializar las tablas

Una sola vez, desde tu computadora (con `curl`, Postman, o similar):

```
curl -X POST https://TU-PROYECTO.vercel.app/api/setup \
  -H "x-admin-secret: TU_ADMIN_SECRET"
```

Debería responder `{"ok":true,"message":"Base de datos lista."}`.

## 6. Usar el panel

Entrá a `https://TU-PROYECTO.vercel.app/` (o `/admin.html`), pegá tu `ADMIN_SECRET` y ya podés
crear, renovar, suspender y reasignar licencias por negocio.

## 7. Conectar Qubiq Control con este servidor

De vuelta en tu proyecto **Qubiq Control** (en Claude Code, en tu PC), la variable
`LICENSE_SERVER_URL` debe apuntar a:

```
https://TU-PROYECTO.vercel.app/api/license/verify
```

Configurala como valor por defecto en `src/config.js` para que quede incluida en cada
instalador que generes de ahora en adelante — así no tenés que configurarla a mano en cada
negocio.

## Endpoints

| Método | Ruta | Auth | Uso |
|---|---|---|---|
| POST | `/api/setup` | admin | Crea las tablas (una sola vez) |
| POST | `/api/license/verify` | público | Lo llama cada instalación de Qubiq Control |
| POST | `/api/license/create` | admin | Nueva licencia para un negocio |
| GET | `/api/license/list` | admin | Lista todas las licencias |
| POST | `/api/license/renew` | admin | Extiende el vencimiento |
| POST | `/api/license/status` | admin | Suspende / reactiva |
| POST | `/api/license/reset-machine` | admin | Libera la licencia para activarla en otro equipo |

Todas las rutas de admin requieren el header `x-admin-secret: TU_ADMIN_SECRET`.
