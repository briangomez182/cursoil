import type { Usuario } from '@/lib/types';
import Aparecer from './Aparecer';

function iniciales(nombre: string): string {
  return nombre
    .replace(/^(Ing\.|Lic\.|Dr\.|Dra\.)\s*/i, '')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export default function SeccionProfesores({ profesores }: { profesores: Usuario[] }) {
  return (
    <section id="profesores" className="mt-20" aria-labelledby="titulo-profesores">
      <Aparecer>
        <p className="chip">Equipo docente</p>
        <h2 id="titulo-profesores" className="mt-3 text-3xl font-extrabold tracking-tight text-night sm:text-4xl">
          Profesores con campo, no solo con teoria
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
          Cada curso esta a cargo de especialistas activos en la industria venezolana de hidrocarburos.
        </p>
      </Aparecer>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {profesores.map((profesor, i) => (
          <Aparecer key={profesor.id} retraso={i * 0.08}>
            <article className="h-full rounded-[2rem] border border-slate-100 bg-white p-7 shadow-card">
              <div className="grid h-16 w-16 place-items-center rounded-3xl bg-petro-100 text-lg font-extrabold text-petro-700">
                {iniciales(profesor.nombre)}
              </div>
              <h3 className="mt-5 text-lg font-bold text-night">{profesor.nombre}</h3>
              <p className="mt-1 text-sm font-semibold text-petro-600">{profesor.especialidad}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">{profesor.bio}</p>
            </article>
          </Aparecer>
        ))}
      </div>
    </section>
  );
}
