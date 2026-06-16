import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Resetea la base de datos ejecutando el script SQL inicial.
 * Elimina y recrea las tablas, recarga los datos y corrige las secuencias SERIAL.
 * @param {import('pg').Client} client - Cliente de PostgreSQL conectado.
 * @returns {Promise<void>}
 */
export async function resetearBDD(client) {
  const sql = readFileSync(join(__dirname, 'eventos_masivos.sql'), 'utf8');
  await client.query(sql);
}
