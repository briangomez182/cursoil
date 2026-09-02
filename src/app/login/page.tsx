import Link from 'next/link';
import type { Metadata } from 'next';
import MarcoAuth from '@/components/MarcoAuth';
import FormularioLogin from '@/components/FormularioLogin';

export const metadata: Metadata = { title: 'Iniciar sesion | Cursoil' };

export default function PaginaLogin({ searchParams }: { searchParams: { correo?: string } }) {
  const correoConfirmado: boolean = searchParams?.correo === 'confirmado';

  return (
    <MarcoAuth
      titulo="Bienvenido de vuelta"
      subtitulo="Accede como alumno, profesor o administrador."
      pie={
        <p>
          No tienes cuenta?{' '}
          <Link href="/register" className="font-semibold text-petro-600 underline">Registrate aqui</Link>
        </p>
      }
    >
      <>
        {correoConfirmado && (
          <p className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            Tu correo quedo confirmado. Cuando un administrador acepte tu cuenta podras iniciar sesion.
          </p>
        )}
        <FormularioLogin />
      </>
    </MarcoAuth>
  );
}
