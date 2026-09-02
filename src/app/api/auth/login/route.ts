import { NextResponse } from 'next/server';
import { getSupabase, getSupabaseAuth, supabaseAuthConfigurado, supabaseConfigurado } from '@/lib/supabase';
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
  email: string | null;
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
      crearCookieSesion({ id: 'admin-local', usuario: 'admin', nombre: 'Administrador Cursoil', rol: 'admin' });
      return NextResponse.json({ ok: true, rol: 'admin' });
    }
    return NextResponse.json(
      { error: 'Supabase no esta configurado. Usa admin/admin o completa .env.local.' },
      { status: 401 },
    );
  }

  const { data, error } = await getSupabase()
    .from('usuarios')
    .select('id,usuario,nombre,email,rol,password_hash,activo')
    .or(`usuario.eq.${usuario},email.eq.${usuario}`)
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'No se pudo consultar la base de datos.' }, { status: 500 });
  }

  const fila = data as FilaUsuario | null;
  if (!fila) {
    return NextResponse.json({ error: 'Credenciales invalidas.' }, { status: 401 });
  }

  // Alumnos: se validan contra Supabase Auth, que exige el correo confirmado.
  // Profesores / admin: siguen con el hash local (no pasan por Supabase Auth).
  if (fila.rol === 'alumno' && supabaseAuthConfigurado) {
    const { error: errorAuth } = await getSupabaseAuth().auth.signInWithPassword({
      email: fila.email ?? usuario,
      password,
    });
    if (errorAuth) {
      if (/not confirmed/i.test(errorAuth.message)) {
        return NextResponse.json(
          { error: 'Debes confirmar tu correo. Abre el enlace que te enviamos al registrarte.' },
          { status: 403 },
        );
      }
      return NextResponse.json({ error: 'Credenciales invalidas.' }, { status: 401 });
    }
  } else if (!verifyPassword(password, fila.password_hash)) {
    return NextResponse.json({ error: 'Credenciales invalidas.' }, { status: 401 });
  }

  if (!fila.activo) {
    const error: string =
      fila.rol === 'alumno'
        ? 'Tu cuenta todavia no fue aceptada por un administrador.'
        : 'Tu cuenta esta desactivada. Contacta al administrador.';
    return NextResponse.json({ error }, { status: 403 });
  }

  crearCookieSesion({ id: fila.id, usuario: fila.usuario, nombre: fila.nombre, rol: fila.rol });
  return NextResponse.json({ ok: true, rol: fila.rol });
}
