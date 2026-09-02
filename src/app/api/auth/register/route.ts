import { NextResponse } from 'next/server';
import { getSupabase, getSupabaseAuth, supabaseAuthConfigurado, supabaseConfigurado } from '@/lib/supabase';
import { hashPassword } from '@/lib/passwords';

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

  // 1) Perfil del alumno en estado pendiente (activo = false): un administrador debe aceptarlo.
  const { data: creado, error } = await getSupabase()
    .from('usuarios')
    .insert({ nombre, usuario, email, password_hash: hashPassword(password), rol: 'alumno', activo: false })
    .select('id')
    .single();

  if (error) {
    const duplicado: boolean = error.code === '23505';
    return NextResponse.json(
      { error: duplicado ? 'Ese usuario o correo ya esta registrado.' : 'No se pudo crear la cuenta.' },
      { status: duplicado ? 409 : 500 },
    );
  }

  // 2) Alta en Supabase Auth.
  //    - Por defecto: signUp() envia el correo de confirmacion.
  //    - Con ALUMNOS_CONFIRMAN_CORREO=false: se crea ya confirmado, sin enviar correo
  //      (util mientras no haya SMTP propio: el correo integrado de Supabase permite ~2/hora).
  const pedirConfirmacion: boolean =
    supabaseAuthConfigurado && process.env.ALUMNOS_CONFIRMAN_CORREO !== 'false';

  if (supabaseAuthConfigurado) {
    const revertirPerfil = () => getSupabase().from('usuarios').delete().eq('id', creado.id);

    if (pedirConfirmacion) {
      const origen: string = new URL(request.url).origin;
      const { error: errorAuth } = await getSupabaseAuth().auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${origen}/login?correo=confirmado`, data: { nombre, usuario } },
      });

      if (errorAuth) {
        await revertirPerfil();
        console.error('[register] Supabase Auth signUp fallo:', errorAuth.message);

        const duplicado: boolean = /already|registered|exists/i.test(errorAuth.message);
        const correoInvalido: boolean = /invalid|valid email/i.test(errorAuth.message);
        const limite: boolean = /rate limit/i.test(errorAuth.message);
        if (duplicado) {
          return NextResponse.json({ error: 'Ese correo ya tiene una cuenta.' }, { status: 409 });
        }
        if (correoInvalido) {
          return NextResponse.json({ error: 'El correo no parece valido. Revisalo e intenta de nuevo.' }, { status: 400 });
        }
        if (limite) {
          return NextResponse.json(
            {
              error:
                'El servicio de correo de Supabase alcanzo su limite (2 por hora). Configura un SMTP propio ' +
                'o pon ALUMNOS_CONFIRMAN_CORREO=false para que el administrador acepte sin confirmacion por correo.',
            },
            { status: 429 },
          );
        }
        return NextResponse.json(
          { error: 'No se pudo enviar el correo de confirmacion. Intenta de nuevo en unos minutos.' },
          { status: 502 },
        );
      }
    } else {
      // Sin confirmacion por correo: el alumno queda con el correo ya verificado en Auth.
      const { error: errorAuth } = await getSupabase().auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nombre, usuario },
      });

      if (errorAuth) {
        await revertirPerfil();
        console.error('[register] Supabase Auth createUser fallo:', errorAuth.message);
        const duplicado: boolean = /already|registered|exists/i.test(errorAuth.message);
        return NextResponse.json(
          { error: duplicado ? 'Ese correo ya tiene una cuenta.' : 'No se pudo crear la cuenta.' },
          { status: duplicado ? 409 : 500 },
        );
      }
    }
  }

  return NextResponse.json({
    ok: true,
    pendiente: true,
    confirmacionCorreo: pedirConfirmacion,
    mensaje: pedirConfirmacion
      ? `Te enviamos un correo a ${email} para confirmar tu cuenta. Cuando lo confirmes, un administrador debe aceptarte para que puedas iniciar sesion.`
      : 'Tu solicitud fue enviada. Un administrador debe aceptar tu cuenta antes de que puedas iniciar sesion.',
  });
}
