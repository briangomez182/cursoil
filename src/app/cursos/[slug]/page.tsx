import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import Logo from '@/components/Logo';
import Aparecer from '@/components/Aparecer';
import VisorItem from '@/components/VisorItem';
import ExamenModulo from '@/components/ExamenModulo';
import BotonSalir from '@/components/BotonSalir';
import FiltroModulos from '@/components/FiltroModulos';
import { listarCursosPublicos, listarItems, listarModulos, listarPreguntasPublicas, listarTemas } from '@/lib/data';
import { getSesion } from '@/lib/session';
import type { Item, Modulo, PreguntaPublica, Tema } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function PaginaCurso({ params }: { params: { slug: string } }) {
  const sesion = getSesion();
  const puedeVerContenido: boolean = sesion?.rol === 'alumno';

  const [cursos, modulos, temas] = await Promise.all([
    listarCursosPublicos(),
    listarModulos(),
    listarTemas(),
  ]);
  const [items, preguntas]: [Item[], PreguntaPublica[]] = puedeVerContenido
    ? await Promise.all([listarItems(), listarPreguntasPublicas()])
    : [[], []];

  const curso = cursos.find((c) => c.slug === params.slug);
  if (!curso) notFound();

  const misModulos: Modulo[] = modulos.filter((m) => m.curso_id === curso.id);

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-[1200px] bg-white">
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-12">
          <Logo />
          <div className="flex items-center gap-4">
            <Link href="/#cursos" className="text-sm font-semibold text-slate-500 transition hover:text-night">
              Todos los cursos
            </Link>
            {sesion && <BotonSalir className="cta-suave" />}
          </div>
        </header>

        <main className="bg-white px-6 py-12 sm:px-12">
          <Aparecer>
            <span className="chip">{curso.categoria} - {curso.nivel}</span>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-night">{curso.titulo}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">{curso.descripcion}</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-petro-600">{curso.duracion_horas} horas academicas</p>
          </Aparecer>

          {curso.portada_url && (
            <div className="mt-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-petro-50 to-petro-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={curso.portada_url}
                alt={`Portada del curso ${curso.titulo}`}
                className="max-h-[380px] w-full object-cover"
              />
            </div>
          )}

          <div className="mt-12 space-y-8">
            {!puedeVerContenido && misModulos.length > 0 && (
              <Aparecer>
                <div className="rounded-[2rem] bg-petro-50 p-8 text-center sm:p-10">
                  <p className="chip mx-auto w-fit">Acceso para alumnos</p>
                  <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-night">
                    Inicia sesion para ver el contenido completo
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                    Aqui puedes revisar el programa del curso. Para acceder a las presentaciones, documentos y videos
                    de cada tema, inicia sesion con tu cuenta de alumno.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link href="/login" className="cta">Iniciar sesion</Link>
                    <Link href="/register" className="cta-suave">Crear cuenta de alumno</Link>
                  </div>
                </div>
              </Aparecer>
            )}

            {misModulos.length > 0 && (
              <FiltroModulos
                modulos={misModulos.map((modulo) => {
                  const misTemas: Tema[] = temas.filter((t) => t.modulo_id === modulo.id);
                  const susPreguntas: PreguntaPublica[] = preguntas.filter((p) => p.modulo_id === modulo.id);
                  return {
                    id: modulo.id,
                    texto: `${modulo.titulo} ${modulo.descripcion ?? ''} ${misTemas.map((t) => t.titulo).join(' ')}`,
                    nodo: (
                <section
                  aria-labelledby={`mod-${modulo.id}`}
                  className={puedeVerContenido ? undefined : 'rounded-[2rem] border border-slate-100 bg-white p-6 shadow-card sm:p-8'}
                >
                  <h2 id={`mod-${modulo.id}`} className="text-xl font-extrabold tracking-tight text-night">{modulo.titulo}</h2>
                  {modulo.descripcion && <p className="mt-1 text-sm text-slate-500">{modulo.descripcion}</p>}

                  {puedeVerContenido ? (
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

                      {susPreguntas.length > 0 ? (
                        <ExamenModulo moduloId={modulo.id} moduloTitulo={modulo.titulo} preguntas={susPreguntas} />
                      ) : (
                        <p className="mt-8 rounded-[2rem] border border-dashed border-petro-200 bg-petro-50/40 p-6 text-center text-sm text-slate-500">
                          El examen final de este modulo todavia no esta disponible.
                        </p>
                      )}
                    </div>
                  ) : (
                    <ul className="mt-5 space-y-2">
                      {misTemas.map((tema) => (
                        <li key={tema.id} className="flex items-center gap-3 rounded-2xl bg-petro-50/60 px-4 py-3 text-sm font-semibold text-night">
                          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-petro-500" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                            <rect x="5" y="10" width="14" height="10" rx="2" />
                            <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
                          </svg>
                          {tema.titulo}
                        </li>
                      ))}
                      {misTemas.length === 0 && (
                        <li className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-400">Temario en preparacion.</li>
                      )}
                    </ul>
                  )}
                </section>
                    ),
                  };
                })}
              />
            )}

            {misModulos.length === 0 && (
              <div className="rounded-[2rem] border border-slate-100 bg-white p-12 text-center shadow-card">
                <p className="text-sm font-semibold text-night">
                  El programa de este curso se esta cargando.
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                  Escribenos para conocer el temario completo.
                </p>
                {curso.id.startsWith('demo-') && (
                  <p className="mx-auto mt-6 max-w-lg rounded-2xl bg-amber-50 px-5 py-4 text-left text-xs leading-relaxed text-amber-700">
                    <strong className="block">Modo demostracion</strong>
                    La base de datos no devolvio cursos, asi que se esta mostrando el catalogo de respaldo
                    (<code>src/lib/demo.ts</code>) y por eso no hay modulos. Ejecuta{' '}
                    <code>npm run seed</code> para cargar el contenido real en Supabase, o{' '}
                    <code>npm run diagnostico</code> para revisar la conexion.
                  </p>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
