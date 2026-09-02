/**
 * Crea (o actualiza) alumnos de ejemplo YA ACEPTADOS para poder recorrer los cursos.
 * Uso: npm run seed:alumnos
 *      o: node --env-file=.env.local supabase/seed-alumnos.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { randomBytes, scryptSync } from 'node:crypto';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const hash = (plano) => {
  const salt = randomBytes(16).toString('hex');
  return `scrypt$${salt}$${scryptSync(plano, salt, 64).toString('hex')}`;
};

const db = createClient(url, key, { auth: { persistSession: false } });

const CLAVE = 'alumno123';

const alumnos = [
  {
    usuario: 'mgonzalez',
    nombre: 'Maria Gonzalez',
    email: 'm.gonzalez@correo.com',
    rol: 'alumno',
    activo: true, // ya aceptado por el administrador
    password_hash: hash(CLAVE),
  },
  {
    usuario: 'pramirez',
    nombre: 'Pedro Ramirez',
    email: 'p.ramirez@correo.com',
    rol: 'alumno',
    activo: true,
    password_hash: hash(CLAVE),
  },
];

const { data, error } = await db.from('usuarios').upsert(alumnos, { onConflict: 'usuario' }).select('usuario,nombre,rol,activo');

if (error) {
  console.error('Error creando alumnos:', error.message);
  process.exit(1);
}

// Alta en Supabase Auth con el correo YA confirmado (email_confirm: true),
// para que puedan iniciar sesion con el nuevo flujo sin esperar el mail.
for (const a of alumnos) {
  const { error: errAuth } = await db.auth.admin.createUser({
    email: a.email,
    password: CLAVE,
    email_confirm: true,
    user_metadata: { nombre: a.nombre, usuario: a.usuario },
  });
  if (errAuth && !/already|registered|exists/i.test(errAuth.message)) {
    console.error(`Auth ${a.email}:`, errAuth.message);
  }
}

console.log('Alumnos listos (perfil + Supabase Auth con correo confirmado):');
for (const a of data) console.log(`  ${a.usuario.padEnd(12)} | ${a.nombre.padEnd(18)} | activo: ${a.activo} | clave: ${CLAVE}`);
