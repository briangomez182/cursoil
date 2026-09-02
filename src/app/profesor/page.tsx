import type { Metadata } from 'next';
import CabeceraPanel from '@/components/CabeceraPanel';
import PanelGestion from '@/components/panel/PanelGestion';
import { getSesion } from '@/lib/session';
import { listarTabla } from '@/lib/data';
import type { Curso, CursoProfesor } from '@/lib/types';
import { PLATAFORMA } from '@/lib/config';

export const metadata: Metadata = { title: 'Panel del profesor | Cursoil' };
export const dynamic = 'force-dynamic';

export default async function PaginaProfesor() {
  const sesion = getSesion();
  if (!sesion) return null;

  const [cursos, vinculos] = await Promise.all([
    listarTabla<Curso>('cursos'),
    listarTabla<CursoProfesor>('curso_profesores', 'id'),
  ]);

  const misCursoIds: string[] = vinculos.filter((v) => v.profesor_id === sesion.id).map((v) => v.curso_id);
  const misCursos: Curso[] = cursos.filter((c) => misCursoIds.includes(c.id));

  return (
    <div className="min-h-screen bg-white px-5 py-8 sm:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <CabeceraPanel sesion={sesion} titulo="Panel del profesor" />

        <section className="rounded-[2rem] bg-white p-6 shadow-card sm:p-8" aria-labelledby="mis-cursos">
          <h2 id="mis-cursos" className="text-xl font-extrabold tracking-tight text-night">Cursos asignados</h2>
          <p className="mt-1 text-sm text-slate-500">
            Gestiona el material de tus clases. Para cambios de asignacion escribe al {PLATAFORMA.telefonoLegible}.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {misCursos.map((curso) => (
              <article key={curso.id} className="rounded-3xl bg-petro-50 p-6">
                <span className="chip bg-white text-petro-700">{curso.categoria}</span>
                <h3 className="mt-3 text-base font-bold text-night">{curso.titulo}</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">{curso.nivel} - {curso.duracion_horas} h</p>
              </article>
            ))}
            {misCursos.length === 0 && (
              <p className="md:col-span-3 rounded-3xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                Aun no tienes cursos asignados. El administrador puede asignarlos desde su panel.
              </p>
            )}
          </div>
        </section>

        <main>
          <PanelGestion rol="profesor" />
        </main>
      </div>
    </div>
  );
}
