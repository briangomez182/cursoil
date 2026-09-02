'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  /** Clases del boton. Por defecto usa el estilo `cta-suave`. */
  className?: string;
  children?: React.ReactNode;
}

/** Cierra la sesion (borra la cookie) y vuelve al inicio. Sirve para admin, profesor y alumno. */
export default function BotonSalir({ className = 'cta-suave', children = 'Cerrar sesion' }: Props) {
  const router = useRouter();
  const [saliendo, setSaliendo] = useState<boolean>(false);

  async function salir(): Promise<void> {
    setSaliendo(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Aunque falle la red, igual redirigimos: la cookie se revalida en el servidor.
    } finally {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <button type="button" onClick={() => void salir()} disabled={saliendo} className={className}>
      {saliendo ? 'Saliendo...' : children}
    </button>
  );
}
