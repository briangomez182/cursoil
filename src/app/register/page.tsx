import Link from 'next/link';
import type { Metadata } from 'next';
import MarcoAuth from '@/components/MarcoAuth';
import FormularioRegistro from '@/components/FormularioRegistro';

export const metadata: Metadata = { title: 'Crear cuenta | Cursoil' };

export default function PaginaRegistro() {
  return (
    <MarcoAuth
      titulo="Crea tu cuenta de alumno"
      subtitulo="Accede al catalogo completo de cursos de la industria petrolera."
      pie={
        <p>
          Ya tienes cuenta?{' '}
          <Link href="/login" className="font-semibold text-petro-600 underline">Inicia sesion</Link>
        </p>
      }
    >
      <FormularioRegistro />
    </MarcoAuth>
  );
}
