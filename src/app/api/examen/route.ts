import { NextResponse } from 'next/server';
import { getSupabase, supabaseConfigurado } from '@/lib/supabase';
import { getSesion } from '@/lib/session';
import { LETRAS_OPCION, UMBRAL_APROBACION, type OpcionLetra, type ResultadoExamen } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface Cuerpo {
  modulo_id?: string;
  /** { [preguntaId]: 'a' | 'b' | 'c' | 'd' } */
  respuestas?: Record<string, string>;
}

function esLetra(valor: unknown): valor is OpcionLetra {
  return typeof valor === 'string' && (LETRAS_OPCION as readonly string[]).includes(valor);
}

/** Corrige el examen de un modulo en el servidor y registra el intento del alumno. */
export async function POST(request: Request) {
  if (!supabaseConfigurado) {
    return NextResponse.json({ error: 'Supabase no esta configurado.' }, { status: 503 });
  }

  const { modulo_id: moduloId, respuestas = {} } = (await request.json()) as Cuerpo;
  if (!moduloId) {
    return NextResponse.json({ error: 'Falta el modulo.' }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from('preguntas')
    .select('id,correcta,orden')
    .eq('modulo_id', moduloId)
    .order('orden', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Este modulo todavia no tiene examen.' }, { status: 404 });
  }

  const preguntas = data as { id: string; correcta: OpcionLetra }[];
  const detalle: ResultadoExamen['detalle'] = preguntas.map((p) => {
    const elegidaCruda = respuestas[p.id];
    return {
      pregunta_id: p.id,
      elegida: esLetra(elegidaCruda) ? elegidaCruda : null,
      correcta: p.correcta,
    };
  });

  const total: number = preguntas.length;
  const puntaje: number = detalle.filter((d) => d.elegida === d.correcta).length;
  const aprobado: boolean = puntaje / total >= UMBRAL_APROBACION;

  const sesion = getSesion();
  if (sesion?.rol === 'alumno') {
    await getSupabase()
      .from('intentos_examen')
      .insert({ modulo_id: moduloId, alumno_id: sesion.id, puntaje, total, aprobado });
  }

  const resultado: ResultadoExamen = { puntaje, total, aprobado, detalle };
  return NextResponse.json(resultado);
}
