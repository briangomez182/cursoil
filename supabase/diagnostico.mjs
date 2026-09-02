/**
 * Diagnostico de conexion y contenido.
 * Uso: node --env-file=.env.local supabase/diagnostico.mjs
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('X Faltan variables en .env.local');
  process.exit(1);
}
console.log('URL:', url, '\n');

const db = createClient(url, key, { auth: { persistSession: false } });
const tablas = ['usuarios', 'cursos', 'modulos', 'temas', 'items', 'curso_profesores'];

for (const tabla of tablas) {
  const { count, error } = await db.from(tabla).select('*', { count: 'exact', head: true });
  if (error) {
    console.log(`X ${tabla.padEnd(18)} ERROR: ${error.message}`);
  } else {
    console.log(`  ${tabla.padEnd(18)} ${count} registro(s)`);
  }
}

const { data: curso } = await db.from('cursos').select('id,titulo,slug').eq('slug', 'fundamentos-perforacion').maybeSingle();

if (!curso) {
  console.log('\nX No existe el curso "fundamentos-perforacion" en la base de datos.');
  console.log('  La landing te esta mostrando el catalogo DEMO (datos de respaldo en src/lib/demo.ts),');
  console.log('  por eso el programa del curso aparece vacio.');
  console.log('  Solucion: node --env-file=.env.local supabase/seed.mjs');
  process.exit(0);
}

console.log(`\nCurso encontrado: ${curso.titulo} (${curso.id})`);
const { data: mods } = await db.from('modulos').select('id,titulo').eq('curso_id', curso.id);
console.log(`  Modulos: ${mods?.length ?? 0}`);

for (const m of mods ?? []) {
  const { data: tms } = await db.from('temas').select('id,titulo').eq('modulo_id', m.id);
  console.log(`   - ${m.titulo}: ${tms?.length ?? 0} tema(s)`);
  for (const t of tms ?? []) {
    const { count } = await db.from('items').select('*', { count: 'exact', head: true }).eq('tema_id', t.id);
    console.log(`      * ${t.titulo}: ${count} item(s)`);
  }
}
