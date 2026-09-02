import { NextResponse } from 'next/server';
import { getSupabase, supabaseConfigurado } from '@/lib/supabase';
import { getSesion } from '@/lib/session';
import { hashPassword } from '@/lib/passwords';
import { RECURSOS, esTablaValida, sanear } from '@/lib/recursos';

interface Contexto {
  params: { tabla: string; id: string };
}

export async function PATCH(request: Request, { params }: Contexto) {
  const sesion = getSesion();
  if (!sesion) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  if (!esTablaValida(params.tabla)) return NextResponse.json({ error: 'Recurso desconocido.' }, { status: 404 });
  if (!RECURSOS[params.tabla].escritura.includes(sesion.rol)) {
    return NextResponse.json({ error: 'Tu rol no puede editar este recurso.' }, { status: 403 });
  }
  if (!supabaseConfigurado) return NextResponse.json({ error: 'Supabase no configurado.' }, { status: 503 });

  const cuerpo = (await request.json()) as Record<string, unknown>;
  const cambios: Record<string, unknown> = sanear(params.tabla, cuerpo);

  if (params.tabla === 'usuarios') {
    const clave = cambios.password as string | undefined;
    delete cambios.password;
    if (clave) cambios.password_hash = hashPassword(clave);
  }

  const { data, error } = await getSupabase().from(params.tabla).update(cambios).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ dato: data });
}

export async function DELETE(_request: Request, { params }: Contexto) {
  const sesion = getSesion();
  if (!sesion) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  if (!esTablaValida(params.tabla)) return NextResponse.json({ error: 'Recurso desconocido.' }, { status: 404 });
  if (!RECURSOS[params.tabla].escritura.includes(sesion.rol)) {
    return NextResponse.json({ error: 'Tu rol no puede eliminar en este recurso.' }, { status: 403 });
  }
  if (!supabaseConfigurado) return NextResponse.json({ error: 'Supabase no configurado.' }, { status: 503 });

  const { error } = await getSupabase().from(params.tabla).delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
