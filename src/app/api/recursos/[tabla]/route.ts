import { NextResponse } from 'next/server';
import { getSupabase, supabaseConfigurado } from '@/lib/supabase';
import { getSesion } from '@/lib/session';
import { hashPassword } from '@/lib/passwords';
import { RECURSOS, esTablaValida, sanear } from '@/lib/recursos';

const SIN_DB = { error: 'Supabase no esta configurado. Completa .env.local y ejecuta supabase/schema.sql.' };

export async function GET(_request: Request, { params }: { params: { tabla: string } }) {
  const sesion = getSesion();
  if (!sesion || sesion.rol === 'alumno') return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  if (!esTablaValida(params.tabla)) return NextResponse.json({ error: 'Recurso desconocido.' }, { status: 404 });
  if (!supabaseConfigurado) return NextResponse.json({ datos: [], aviso: SIN_DB.error });

  const columnas: string = params.tabla === 'usuarios' ? 'id,usuario,email,nombre,rol,especialidad,bio,avatar_url,telefono,activo,creado_en' : '*';

  const { data, error } = await getSupabase()
    .from(params.tabla)
    .select(columnas)
    .order(RECURSOS[params.tabla].orden, { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Para la tabla de usuarios: adjunta si el correo esta confirmado en Supabase Auth.
  if (params.tabla === 'usuarios' && Array.isArray(data)) {
    try {
      const { data: auth } = await getSupabase().auth.admin.listUsers({ page: 1, perPage: 1000 });
      const confirmados = new Map<string, boolean>();
      for (const u of auth?.users ?? []) {
        if (u.email) confirmados.set(u.email.toLowerCase(), Boolean(u.email_confirmed_at));
      }
      const conEstado = (data as unknown as Record<string, unknown>[]).map((fila) => ({
        ...fila,
        correo_confirmado: fila.email ? confirmados.get(String(fila.email).toLowerCase()) ?? false : false,
      }));
      return NextResponse.json({ datos: conEstado });
    } catch {
      // Si Auth no responde, se devuelve la tabla sin el estado de confirmacion.
    }
  }

  return NextResponse.json({ datos: data ?? [] });
}

export async function POST(request: Request, { params }: { params: { tabla: string } }) {
  const sesion = getSesion();
  if (!sesion) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  if (!esTablaValida(params.tabla)) return NextResponse.json({ error: 'Recurso desconocido.' }, { status: 404 });
  if (!RECURSOS[params.tabla].escritura.includes(sesion.rol)) {
    return NextResponse.json({ error: 'Tu rol no puede crear en este recurso.' }, { status: 403 });
  }
  if (!supabaseConfigurado) return NextResponse.json(SIN_DB, { status: 503 });

  const cuerpo = (await request.json()) as Record<string, unknown>;
  const registro: Record<string, unknown> = sanear(params.tabla, cuerpo);

  if (params.tabla === 'usuarios') {
    const clave = (registro.password as string | undefined) ?? '';
    delete registro.password;
    registro.password_hash = hashPassword(clave.length >= 4 ? clave : 'profesor123');
  }

  const { data, error } = await getSupabase().from(params.tabla).insert(registro).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ dato: data }, { status: 201 });
}
