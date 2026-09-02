import Link from 'next/link';
import type { Metadata } from 'next';
import MarcoAuth from '@/components/MarcoAuth';
import FormularioLogin from '@/components/FormularioLogin';

export const metadata: Metadata = { title: 'Iniciar sesion | PetroLearn' };

export default function PaginaLogin() {
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
      <FormularioLogin />
    </MarcoAuth>
  );
}
