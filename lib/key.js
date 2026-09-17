import { randomInt } from 'node:crypto';

// Sin caracteres ambiguos (0/O, 1/I) para que se puedan leer y transcribir por teléfono/WhatsApp sin errores.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function group(length = 4) {
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

export function generateLicenseKey() {
  return `QBQ-${group()}-${group()}-${group()}-${group()}`;
}
