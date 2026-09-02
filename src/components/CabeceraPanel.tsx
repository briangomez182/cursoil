import Logo from './Logo';
import BotonSalir from './BotonSalir';
import type { SesionUsuario } from '@/lib/types';

export default function CabeceraPanel({ sesion, titulo }: { sesion: SesionUsuario; titulo: string }) {
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
      <BotonSalir />
    </header>
  );
}
