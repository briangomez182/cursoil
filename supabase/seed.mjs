/**
 * Seed de PetroLearn.
 * 1) Ejecuta supabase/schema.sql en el SQL Editor de Supabase.
 * 2) Completa .env.local
 * 3) node --env-file=.env.local supabase/seed.mjs
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

const usuarios = [
  { usuario: 'admin', nombre: 'Administrador PetroLearn', email: 'admin@petrolearn.com.ve', rol: 'admin', password_hash: hash('admin'), especialidad: 'Direccion academica' },
  { usuario: 'jmendoza', nombre: 'Ing. Jose Mendoza', email: 'j.mendoza@petrolearn.com.ve', rol: 'profesor', password_hash: hash('profesor123'), especialidad: 'Perforacion y Completacion de Pozos', bio: 'Veinte anos en operaciones upstream en la Faja Petrolifera del Orinoco.' },
  { usuario: 'lrivas', nombre: 'Ing. Luisa Rivas', email: 'l.rivas@petrolearn.com.ve', rol: 'profesor', password_hash: hash('profesor123'), especialidad: 'Refinacion y Procesos Downstream', bio: 'Especialista en destilacion atmosferica y craqueo catalitico.' },
  { usuario: 'cbastidas', nombre: 'Lic. Carlos Bastidas', email: 'c.bastidas@petrolearn.com.ve', rol: 'profesor', password_hash: hash('profesor123'), especialidad: 'Seguridad Industrial y Ambiente', bio: 'Auditor SIAHO certificado, formador en normativa COVENIN y API.' },
];

const cursos = [
  { titulo: 'Fundamentos de Perforacion de Pozos', slug: 'fundamentos-perforacion', categoria: 'Upstream', nivel: 'Basico', duracion_horas: 24, descripcion: 'Desde la geologia del yacimiento hasta el diseno del programa de perforacion rotatoria.' },
  { titulo: 'Operacion de Unidades de Destilacion', slug: 'unidades-destilacion', categoria: 'Refinacion', nivel: 'Avanzado', duracion_horas: 40, descripcion: 'Balance de materia y energia, control de torres y optimizacion de cortes.' },
  { titulo: 'Seguridad en Instalaciones de Hidrocarburos', slug: 'seguridad-hidrocarburos', categoria: 'Seguridad Industrial', nivel: 'Intermedio', duracion_horas: 18, descripcion: 'Analisis de riesgos, permisos de trabajo y respuesta ante emergencias.' },
  { titulo: 'Transporte y Almacenamiento de Crudo', slug: 'transporte-almacenamiento', categoria: 'Midstream', nivel: 'Intermedio', duracion_horas: 22, descripcion: 'Oleoductos, patios de tanques, cisternas y control de perdidas.' },
  { titulo: 'Comercializacion de Productos Derivados', slug: 'comercializacion-derivados', categoria: 'Downstream', nivel: 'Basico', duracion_horas: 16, descripcion: 'Cadena downstream, formacion de precios y logistica de distribucion.' },
  { titulo: 'Normativa y Gerencia de Proyectos Petroleros', slug: 'gerencia-proyectos', categoria: 'Gerencia y Normativa', nivel: 'Avanzado', duracion_horas: 30, descripcion: 'Marco legal venezolano, contratacion y control de proyectos de capital.' },
];

const fallar = (etiqueta, error) => {
  if (error) {
    console.error(`Error en ${etiqueta}:`, error.message);
    process.exit(1);
  }
};

const { data: usuariosCreados, error: e1 } = await db
  .from('usuarios')
  .upsert(usuarios, { onConflict: 'usuario' })
  .select();
fallar('usuarios', e1);
console.log(`Usuarios listos: ${usuariosCreados.length}`);

const { data: cursosCreados, error: e2 } = await db
  .from('cursos')
  .upsert(cursos, { onConflict: 'slug' })
  .select();
fallar('cursos', e2);
console.log(`Cursos listos: ${cursosCreados.length}`);

const profesores = usuariosCreados.filter((u) => u.rol === 'profesor');
const asignaciones = cursosCreados.map((c, i) => ({
  curso_id: c.id,
  profesor_id: profesores[i % profesores.length].id,
}));
const { error: e3 } = await db.from('curso_profesores').upsert(asignaciones, { onConflict: 'curso_id,profesor_id' });
fallar('curso_profesores', e3);

// Contenido de ejemplo para el primer curso
const primero = cursosCreados.find((c) => c.slug === 'fundamentos-perforacion');
const { data: mods, error: e4 } = await db
  .from('modulos')
  .upsert(
    [
      { curso_id: primero.id, titulo: 'Modulo 1 - Geologia del petroleo', orden: 1, descripcion: 'Origen, migracion y trampas de hidrocarburos.' },
      { curso_id: primero.id, titulo: 'Modulo 2 - Equipos de perforacion', orden: 2, descripcion: 'Taladro, sarta, brocas y sistema de circulacion.' },
    ],
    { onConflict: 'id' },
  )
  .select();
fallar('modulos', e4);

const { data: temas, error: e5 } = await db
  .from('temas')
  .upsert(
    [
      { modulo_id: mods[0].id, titulo: 'Tema 1.1 - Roca madre y yacimiento', orden: 1 },
      { modulo_id: mods[1].id, titulo: 'Tema 2.1 - Componentes del taladro', orden: 1 },
    ],
    { onConflict: 'id' },
  )
  .select();
fallar('temas', e5);

const { error: e6 } = await db.from('items').upsert(
  [
    { tema_id: temas[0].id, titulo: 'Presentacion introductoria', tipo: 'presentacion', url: 'https://docs.google.com/presentation/d/e/2PACX-1vQ_ejemplo/embed', orden: 1, duracion_min: 15 },
    { tema_id: temas[0].id, titulo: 'Guia de lectura', tipo: 'documento', contenido: '# Roca madre\n\nLa **roca madre** es la formacion donde se genera el hidrocarburo por maduracion termica de la materia organica.', orden: 2, duracion_min: 20 },
    { tema_id: temas[1].id, titulo: 'Video: recorrido por un taladro', tipo: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', orden: 1, duracion_min: 12 },
  ],
  { onConflict: 'id' },
);
fallar('items', e6);

console.log('\nSeed completado.');
console.log('Admin   -> usuario: admin      | clave: admin');
console.log('Profesor-> usuario: jmendoza   | clave: profesor123');
console.log('Profesor-> usuario: lrivas     | clave: profesor123');
console.log('Profesor-> usuario: cbastidas  | clave: profesor123');
