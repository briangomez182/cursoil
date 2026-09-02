import { NextResponse } from 'next/server';
import { getSupabase, supabaseConfigurado } from '@/lib/supabase';
import { verifyPassword } from '@/lib/passwords';
import { crearCookieSesion } from '@/lib/session';
import type { Rol } from '@/lib/types';

interface CuerpoLogin {
  usuario?: string;
  password?: string;
}

interface FilaUsuario {
  id: string;
  usuario: string;
  nombre: string;
  rol: Rol;
  password_hash: string;
  activo: boolean;
}

export async function POST(request: Request) {
  const cuerpo = (await request.json()) as CuerpoLogin;
  const usuario: string = (cuerpo.usuario ?? '').trim().toLowerCase();
  const password: string = cuerpo.password ?? '';

  if (!usuario || !password) {
    return NextResponse.json({ error: 'Usuario y contrasena son obligatorios.' }, { status: 400 });
  }

  // Acceso de emergencia admin/admin cuando aun no hay base de datos conectada.
  if (!supabaseConfigurado) {
    if (usuario === 'admin' && password === 'admin') {
      crearCookieSesion({ id: 'admin-local', usuario: 'admin', nombre: 'Administrador PetroLearn', rol: 'admin' });
      return NextResponse.json({ ok: true, rol: 'admin' });
    }
    return NextResponse.json(
      { error: 'Supabase no esta configurado. Usa admin/admin o completa .env.local.' },
      { status: 401 },
    );
  }

  const { data, error } = await getSupabase()
    .from('usuarios')
    .select('id,usuario,nombre,rol,password_hash,activo')
    .or(`usuario.eq.${usuario},email.eq.${usuario}`)
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'No se pudo consultar la base de datos.' }, { status: 500 });
  }

  const fila = data as FilaUsuario | null;
  if (!fila || !fila.activo || !verifyPassword(password, fila.password_hash)) {
    return NextResponse.json({ error: 'Credenciales invalidas.' }, { status: 401 });
  }

  crearCookieSesion({ id: fila.id, usuario: fila.usuario, nombre: fila.nombre, rol: fila.rol });
  return NextResponse.json({ ok: true, rol: fila.rol });
}
