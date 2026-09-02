import { NextResponse } from 'next/server';
import { getSupabase, supabaseConfigurado } from '@/lib/supabase';
import { hashPassword } from '@/lib/passwords';
import { crearCookieSesion } from '@/lib/session';

interface CuerpoRegistro {
  nombre?: string;
  usuario?: string;
  email?: string;
  password?: string;
}

export async function POST(request: Request) {
  const cuerpo = (await request.json()) as CuerpoRegistro;
  const nombre: string = (cuerpo.nombre ?? '').trim();
  const usuario: string = (cuerpo.usuario ?? '').trim().toLowerCase();
  const email: string = (cuerpo.email ?? '').trim().toLowerCase();
  const password: string = cuerpo.password ?? '';

  if (!nombre || !usuario || !email || password.length < 6) {
    return NextResponse.json(
      { error: 'Completa todos los campos. La contrasena requiere al menos 6 caracteres.' },
      { status: 400 },
    );
  }

  if (!supabaseConfigurado) {
    return NextResponse.json(
      { error: 'Supabase no esta configurado. Completa .env.local para habilitar el registro.' },
      { status: 503 },
    );
  }

  const { data, error } = await getSupabase()
    .from('usuarios')
    .insert({ nombre, usuario, email, password_hash: hashPassword(password), rol: 'alumno' })
    .select('id,usuario,nombre,rol')
    .single();

  if (error) {
    const duplicado: boolean = error.code === '23505';
    return NextResponse.json(
      { error: duplicado ? 'Ese usuario o correo ya esta registrado.' : 'No se pudo crear la cuenta.' },
      { status: duplicado ? 409 : 500 },
    );
  }

  crearCookieSesion({ id: data.id, usuario: data.usuario, nombre: data.nombre, rol: 'alumno' });
  return NextResponse.json({ ok: true });
}
