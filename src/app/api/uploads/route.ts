import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getSupabase, supabaseConfigurado } from '@/lib/supabase';
import { getSesion } from '@/lib/session';

/** Bucket publico de Supabase Storage donde viven las portadas de los cursos. */
const BUCKET = 'portadas';
const MAX_BYTES = 5 * 1024 * 1024;
const TIPOS_OK: readonly string[] = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

/** Sube una imagen al bucket y devuelve su URL publica. Solo admin y profesor. */
export async function POST(request: Request) {
  const sesion = getSesion();
  if (!sesion || sesion.rol === 'alumno') {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }
  if (!supabaseConfigurado) {
    return NextResponse.json({ error: 'Supabase no esta configurado. Completa .env.local.' }, { status: 503 });
  }

  const formulario = await request.formData();
  const archivo = formulario.get('file');
  if (!(archivo instanceof File)) {
    return NextResponse.json({ error: 'No se recibio ningun archivo.' }, { status: 400 });
  }
  if (!TIPOS_OK.includes(archivo.type)) {
    return NextResponse.json({ error: 'Formato no permitido. Usa JPG, PNG, WEBP, AVIF o GIF.' }, { status: 400 });
  }
  if (archivo.size > MAX_BYTES) {
    return NextResponse.json({ error: 'La imagen supera el limite de 5 MB.' }, { status: 400 });
  }

  const carpeta: string = (String(formulario.get('carpeta') ?? 'cursos').replace(/[^a-z0-9/_-]/gi, '') || 'cursos');
  const extension: string = (archivo.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const ruta = `${carpeta}/${randomUUID()}.${extension}`;

  const buffer = Buffer.from(await archivo.arrayBuffer());
  const { error } = await getSupabase()
    .storage.from(BUCKET)
    .upload(ruta, buffer, { contentType: archivo.type, upsert: false });

  if (error) {
    const pista = /bucket/i.test(error.message)
      ? ` Crea el bucket publico "${BUCKET}" en Supabase (o ejecuta supabase/schema.sql).`
      : '';
    return NextResponse.json({ error: `${error.message}${pista}` }, { status: 400 });
  }

  const { data } = getSupabase().storage.from(BUCKET).getPublicUrl(ruta);
  return NextResponse.json({ url: data.publicUrl, ruta }, { status: 201 });
}
