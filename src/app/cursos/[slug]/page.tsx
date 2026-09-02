import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import Logo from '@/components/Logo';
import Aparecer from '@/components/Aparecer';
import VisorItem from '@/components/VisorItem';
import { listarCursosPublicos, listarItems, listarModulos, listarTemas } from '@/lib/data';
import type { Item, Modulo, Tema } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function PaginaCurso({ params }: { params: { slug: string } }) {
  const [cursos, modulos, temas, items] = await Promise.all([
    listarCursosPublicos(),
    listarModulos(),
    listarTemas(),
    listarItems(),
  ]);

  const curso = cursos.find((c) => c.slug === params.slug);
  if (!curso) notFound();

  const misModulos: Modulo[] = modulos.filter((m) => m.curso_id === curso.id);

  return (
    <div className="px-3 pb-3 pt-3 sm:px-6 sm:pt-6">
      <div className="mx-auto max-w-[1200px] overflow-hidden rounded-[2.5rem] bg-white shadow-soft">
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-12">
          <Logo />
          <Link href="/#cursos" className="text-sm font-semibold text-slate-500 transition hover:text-night">
            Todos los cursos
          </Link>
        </header>

        <main className="bg-canvasbg/40 px-6 py-12 sm:px-12">
          <Aparecer>
            <span className="chip">{curso.categoria} - {curso.nivel}</span>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-night">{curso.titulo}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">{curso.descripcion}</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-petro-600">{curso.duracion_horas} horas academicas</p>
          </Aparecer>

          <div className="mt-12 space-y-12">
            {misModulos.map((modulo) => {
              const misTemas: Tema[] = temas.filter((t) => t.modulo_id === modulo.id);
              return (
                <section key={modulo.id} aria-labelledby={`mod-${modulo.id}`}>
                  <h2 id={`mod-${modulo.id}`} className="text-xl font-extrabold tracking-tight text-night">{modulo.titulo}</h2>
                  {modulo.descripcion && <p className="mt-1 text-sm text-slate-500">{modulo.descripcion}</p>}

                  <div className="mt-6 space-y-8">
                    {misTemas.map((tema) => {
                      const susItems: Item[] = items.filter((i) => i.tema_id === tema.id);
                      return (
                        <div key={tema.id}>
                          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-petro-600">{tema.titulo}</h3>
                          <VisorItem items={susItems} />
                        </div>
                      );
                    })}
                    {misTemas.length === 0 && (
                      <p className="rounded-[2rem] bg-white p-8 text-center text-sm text-slate-500">
                        Este modulo aun no tiene temas cargados.
                      </p>
                    )}
                  </div>
                </section>
              );
            })}

            {misModulos.length === 0 && (
              <p className="rounded-[2rem] bg-white p-12 text-center text-sm text-slate-500">
                El programa de este curso se esta cargando. Escribenos para conocer el temario completo.
              </p>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
