import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import IndustriaPetrolera from '@/components/IndustriaPetrolera';
import CatalogoCursos from '@/components/CatalogoCursos';
import SeccionProfesores from '@/components/SeccionProfesores';
import Aparecer from '@/components/Aparecer';
import { listarCursosPublicos, listarProfesoresPublicos, listarTabla } from '@/lib/data';
import { getSesion } from '@/lib/session';
import { PLATAFORMA } from '@/lib/config';
import type { CursoProfesor } from '@/lib/types';

export const dynamic = 'force-dynamic';

const VENTAJAS: readonly { titulo: string; texto: string }[] = [
  { titulo: 'Certificacion verificable', texto: 'Constancia digital al completar cada ruta formativa.' },
  { titulo: 'Contenido multiformato', texto: 'Presentaciones, documentos tecnicos y video-clases en un solo lugar.' },
  { titulo: 'Acompanamiento docente', texto: 'Profesores asignados por curso que gestionan su propio material.' },
];

export default async function PaginaInicio() {
  const [cursos, profesores, vinculos] = await Promise.all([
    listarCursosPublicos(),
    listarProfesoresPublicos(),
    listarTabla<CursoProfesor>('curso_profesores', 'id'),
  ]);

  const asignaciones: Record<string, string[]> = {};
  vinculos.forEach((v) => {
    asignaciones[v.curso_id] = [...(asignaciones[v.curso_id] ?? []), v.profesor_id];
  });

  const sesion = getSesion();

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-[1600px] bg-white">
        <Navbar sesion={sesion} />

        <main>
          {/* HERO */}
          <section className="relative overflow-hidden px-6 pb-16 pt-14 sm:px-12" aria-labelledby="titulo-hero">
            <div className="pointer-events-none absolute inset-x-0 top-10 mx-auto h-[620px] max-w-4xl rounded-[50%] bg-petro-50" aria-hidden="true" />

            <div className="relative mx-auto max-w-3xl text-center">
              <Aparecer>
                <p className="chip">Formacion industrial - {PLATAFORMA.ciudad}, {PLATAFORMA.estado}</p>
                <h1 id="titulo-hero" className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-night sm:text-6xl">
                  Impulsa tu carrera en <span className="text-petro-600">Petroleo y Gas.</span>
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-base text-slate-500">
                  Cursos profesionales para la industria energetica, dictados por especialistas en operaciones,
                  refinacion y seguridad industrial.
                </p>
              </Aparecer>
            </div>

            <div className="relative mx-auto mt-8 max-w-6xl" id="cursos">
              <CatalogoCursos
                cursos={cursos}
                profesores={profesores}
                asignaciones={asignaciones}
                ilustracion={<IndustriaPetrolera />}
              />
            </div>
          </section>

          {/* NOSOTROS / VENTAJAS */}
          <section id="nosotros" className="border-t border-slate-100 bg-petro-50/60 px-6 py-16 sm:px-12" aria-labelledby="titulo-nosotros">
            <div className="mx-auto max-w-6xl">
              <Aparecer>
                <p className="chip">Por que Cursoil</p>
                <h2 id="titulo-nosotros" className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-night sm:text-4xl">
                  Una plataforma pensada para la operacion real
                </h2>
              </Aparecer>

              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {VENTAJAS.map((v, i) => (
                  <Aparecer key={v.titulo} retraso={i * 0.08}>
                    <article className="h-full rounded-[2rem] bg-white p-7 shadow-card">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-night text-base font-bold text-white">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="mt-5 text-lg font-bold text-night">{v.titulo}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-500">{v.texto}</p>
                    </article>
                  </Aparecer>
                ))}
              </div>
            </div>
          </section>

          {/* PROFESORES + CERTIFICACIONES */}
          <div className="px-6 pb-16 sm:px-12">
            <div className="mx-auto max-w-6xl">
              <SeccionProfesores profesores={profesores} />

              <section id="certificaciones" className="mt-20" aria-labelledby="titulo-cert">
                <Aparecer>
                  <div className="grid gap-8 rounded-[2rem] bg-night p-10 text-white sm:p-14 lg:grid-cols-[1.4fr_1fr] lg:items-center">
                    <div>
                      <p className="chip bg-white/10 text-petro-300">Certificaciones</p>
                      <h2 id="titulo-cert" className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Agenda tu cohorte con un mensaje
                      </h2>
                      <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-300">
                        Programamos formaciones cerradas para empresas y cuadrillas operativas en {PLATAFORMA.estado} y
                        el resto del pais.
                      </p>
                    </div>
                    <address className="not-italic">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Telefono de agendas</p>
                      <a href={`tel:${PLATAFORMA.telefono}`} className="mt-1 block text-2xl font-extrabold text-white">
                        {PLATAFORMA.telefonoLegible}
                      </a>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <a href={PLATAFORMA.whatsapp} target="_blank" rel="noreferrer" className="cta bg-petro-500 hover:bg-petro-600">
                          Escribir por WhatsApp
                        </a>
                        <Link href="/register" className="cta-suave border-white/20 bg-white/10 text-white hover:bg-white/20">
                          Crear cuenta
                        </Link>
                      </div>
                    </address>
                  </div>
                </Aparecer>
              </section>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
