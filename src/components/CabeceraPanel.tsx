'use client';

import { useRouter } from 'next/navigation';
import Logo from './Logo';
import type { SesionUsuario } from '@/lib/types';

export default function CabeceraPanel({ sesion, titulo }: { sesion: SesionUsuario; titulo: string }) {
  const router = useRouter();

  async function salir(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] bg-white px-6 py-5 shadow-card">
      <div className="flex items-center gap-6">
        <Logo compacto />
        <div>
          <h1 className="text-lg font-extrabold tracking-tight text-night">{titulo}</h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-petro-500">
            {sesion.rol} - {sesion.nombre}
          </p>
        </div>
      </div>
      <button type="button" onClick={() => void salir()} className="cta-suave">
        Cerrar sesion
      </button>
    </header>
  );
}
