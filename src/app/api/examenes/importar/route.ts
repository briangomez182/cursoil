import { NextResponse } from 'next/server';
import { getSupabase, supabaseConfigurado } from '@/lib/supabase';
import { getSesion } from '@/lib/session';
import { LETRAS_OPCION, type OpcionLetra } from '@/lib/types';

export const dynamic = 'force-dynamic';

const MAX_PREGUNTAS = 100;

interface Cuerpo {
  modulo_id?: string;
  reemplazar?: boolean;
  /** JSON del archivo: un arreglo de preguntas o un objeto { preguntas: [...] }. */
  contenido?: unknown;
}

interface FilaPregunta {
  modulo_id: string;
  enunciado: string;
  opcion_a: string;
  opcion_b: string;
  opcion_c: string;
  opcion_d: string;
  correcta: OpcionLetra;
  orden: number;
}

function aTexto(valor: unknown): string {
  if (typeof valor === 'string') return valor.trim();
  if (valor === null || valor === undefined) return '';
  return String(valor).trim();
}

/** Primer valor "util" (ni null, ni undefined, ni cadena vacia) entre varias claves alternativas. */
function primerCampo(obj: Record<string, unknown>, claves: readonly string[]): unknown {
  for (const clave of claves) {
    const v = obj[clave];
    if (v !== null && v !== undefined && v !== '') return v;
  }
  return undefined;
}

/** Acepta "a"-"d" (may/min), 1-4, 0-3, o textos cortos tipo "opcion B" / "b)". */
function resolverCorrecta(valor: unknown): OpcionLetra | null {
  if (typeof valor === 'number' && Number.isInteger(valor)) {
    if (valor >= 1 && valor <= 4) return LETRAS_OPCION[valor - 1];
    if (valor >= 0 && valor <= 3) return LETRAS_OPCION[valor];
    return null;
  }
  const s = aTexto(valor).toLowerCase();
  if ((LETRAS_OPCION as readonly string[]).includes(s)) return s as OpcionLetra;
  if (/^[1-4]$/.test(s)) return LETRAS_OPCION[Number(s) - 1];
  if (s.length <= 12) {
    const letra = s.match(/[a-d]/);
    if (letra) return letra[0] as OpcionLetra;
  }
  return null;
}

/** Saca las 4 opciones: como arreglo `opciones` o como campos sueltos `opcion_a`..`opcion_d`. */
function extraerOpciones(obj: Record<string, unknown>): string[] | null {
  const arreglo = primerCampo(obj, ['opciones', 'options', 'respuestas', 'alternativas']);
  if (Array.isArray(arreglo)) return arreglo.map(aTexto);

  const sueltas = [
    aTexto(primerCampo(obj, ['opcion_a', 'a', 'opcionA'])),
    aTexto(primerCampo(obj, ['opcion_b', 'b', 'opcionB'])),
    aTexto(primerCampo(obj, ['opcion_c', 'c', 'opcionC'])),
    aTexto(primerCampo(obj, ['opcion_d', 'd', 'opcionD'])),
  ];
  return sueltas.some(Boolean) ? sueltas : null;
}

/** Importa preguntas de examen de un modulo desde un JSON. Solo admin y profesor. */
export async function POST(request: Request) {
  const sesion = getSesion();
  if (!sesion || sesion.rol === 'alumno') {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }
  if (!supabaseConfigurado) {
    return NextResponse.json({ error: 'Supabase no esta configurado.' }, { status: 503 });
  }

  let cuerpo: Cuerpo;
  try {
    cuerpo = (await request.json()) as Cuerpo;
  } catch {
    return NextResponse.json({ error: 'El cuerpo de la solicitud no es JSON valido.' }, { status: 400 });
  }

  const moduloId = aTexto(cuerpo.modulo_id);
  if (!moduloId) {
    return NextResponse.json({ error: 'Elegi el modulo al que pertenece el examen.' }, { status: 400 });
  }

  const { data: modulo, error: errorModulo } = await getSupabase()
    .from('modulos')
    .select('id,titulo')
    .eq('id', moduloId)
    .maybeSingle();
  if (errorModulo) return NextResponse.json({ error: errorModulo.message }, { status: 500 });
  if (!modulo) return NextResponse.json({ error: 'El modulo indicado no existe.' }, { status: 404 });

  const raiz = cuerpo.contenido;
  const lista: unknown = Array.isArray(raiz)
    ? raiz
    : raiz && typeof raiz === 'object'
      ? (raiz as Record<string, unknown>).preguntas ?? (raiz as Record<string, unknown>).questions
      : undefined;

  if (!Array.isArray(lista) || lista.length === 0) {
    return NextResponse.json(
      { error: 'El archivo no contiene preguntas. Se espera un arreglo, o un objeto con la clave "preguntas".' },
      { status: 422 },
    );
  }
  if (lista.length > MAX_PREGUNTAS) {
    return NextResponse.json(
      { error: `Demasiadas preguntas (${lista.length}). El maximo por importacion es ${MAX_PREGUNTAS}.` },
      { status: 422 },
    );
  }

  const filas: FilaPregunta[] = [];
  const errores: string[] = [];

  lista.forEach((cruda, i) => {
    const n = i + 1;
    if (!cruda || typeof cruda !== 'object') {
      errores.push(`Pregunta ${n}: no es un objeto.`);
      return;
    }
    const obj = cruda as Record<string, unknown>;
    const enunciado = aTexto(primerCampo(obj, ['enunciado', 'pregunta', 'texto', 'title']));
    const opciones = extraerOpciones(obj);
    const correcta = resolverCorrecta(
      primerCampo(obj, ['correcta', 'respuesta', 'respuesta_correcta', 'answer', 'correct']),
    );
    const ordenCrudo = Number(primerCampo(obj, ['orden', 'order']));

    if (!enunciado) errores.push(`Pregunta ${n}: falta el enunciado.`);
    if (!opciones) errores.push(`Pregunta ${n}: faltan las opciones.`);
    else if (opciones.length !== 4) {
      errores.push(`Pregunta ${n}: debe tener exactamente 4 opciones (tiene ${opciones.length}).`);
    } else if (opciones.some((o) => !o)) errores.push(`Pregunta ${n}: hay opciones vacias.`);
    if (!correcta) errores.push(`Pregunta ${n}: campo "correcta" invalido (usa "a"-"d" o 1-4).`);

    if (enunciado && opciones && opciones.length === 4 && opciones.every(Boolean) && correcta) {
      filas.push({
        modulo_id: moduloId,
        enunciado,
        opcion_a: opciones[0],
        opcion_b: opciones[1],
        opcion_c: opciones[2],
        opcion_d: opciones[3],
        correcta,
        orden: Number.isFinite(ordenCrudo) && ordenCrudo > 0 ? Math.trunc(ordenCrudo) : n,
      });
    }
  });

  if (errores.length > 0) {
    return NextResponse.json(
      { error: `El archivo tiene ${errores.length} problema(s) y no se importo nada.`, detalles: errores.slice(0, 12) },
      { status: 422 },
    );
  }

  if (cuerpo.reemplazar) {
    const { error } = await getSupabase().from('preguntas').delete().eq('modulo_id', moduloId);
    if (error) {
      return NextResponse.json(
        { error: `No se pudieron borrar las preguntas actuales: ${error.message}` },
        { status: 500 },
      );
    }
  }

  const { error } = await getSupabase().from('preguntas').insert(filas);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({
    ok: true,
    insertadas: filas.length,
    reemplazadas: Boolean(cuerpo.reemplazar),
    modulo: modulo.titulo,
  });
}
