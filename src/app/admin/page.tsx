import type { Metadata } from 'next';
import CabeceraPanel from '@/components/CabeceraPanel';
import PanelGestion from '@/components/panel/PanelGestion';
import { getSesion } from '@/lib/session';
import { listarTabla } from '@/lib/data';
import type { Curso, Item, Modulo, Usuario } from '@/lib/types';

export const metadata: Metadata = { title: 'Panel de administracion | Cursoil' };
export const dynamic = 'force-dynamic';

export default async function PaginaAdmin() {
  const sesion = getSesion();
  if (!sesion) return null;

  const [cursos, modulos, items, usuarios] = await Promise.all([
    listarTabla<Curso>('cursos'),
    listarTabla<Modulo>('modulos', 'orden'),
    listarTabla<Item>('items', 'orden'),
    listarTabla<Usuario>('usuarios'),
  ]);

  const metricas: readonly { etiqueta: string; valor: number }[] = [
    { etiqueta: 'Cursos', valor: cursos.length },
    { etiqueta: 'Modulos', valor: modulos.length },
    { etiqueta: 'Items de contenido', valor: items.length },
    { etiqueta: 'Profesores', valor: usuarios.filter((u) => u.rol === 'profesor').length },
    { etiqueta: 'Alumnos aceptados', valor: usuarios.filter((u) => u.rol === 'alumno' && u.activo).length },
    { etiqueta: 'Alumnos por aceptar', valor: usuarios.filter((u) => u.rol === 'alumno' && !u.activo).length },
  ];

  return (
    <div className="min-h-screen bg-white px-5 py-8 sm:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <CabeceraPanel sesion={sesion} titulo="Panel de administracion" />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Resumen de la plataforma">
          {metricas.map((m) => (
            <article key={m.etiqueta} className="rounded-[2rem] bg-white p-6 shadow-card">
              <p className="text-4xl font-extrabold tracking-tight text-night">{m.valor}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">{m.etiqueta}</p>
            </article>
          ))}
        </section>

        <main>
          <PanelGestion rol="admin" />
        </main>
      </div>
    </div>
  );
}
