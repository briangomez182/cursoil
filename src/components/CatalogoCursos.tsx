'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CATEGORIAS, NIVELES, type Curso, type Usuario } from '@/lib/types';

interface Props {
  cursos: Curso[];
  profesores: Usuario[];
  asignaciones: Record<string, string[]>;
  ilustracion?: ReactNode;
}

const contenedor = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const tarjeta = {
  oculto: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function CatalogoCursos({ cursos, profesores, asignaciones, ilustracion }: Props) {
  const [texto, setTexto] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('');
  const [nivel, setNivel] = useState<string>('');

  const nombrePorId: Record<string, string> = useMemo(
    () => Object.fromEntries(profesores.map((p) => [p.id, p.nombre])),
    [profesores],
  );

  const filtrados: Curso[] = useMemo(() => {
    const q: string = texto.trim().toLowerCase();
    return cursos.filter((c) => {
      const coincideTexto: boolean =
        q.length === 0 ||
        c.titulo.toLowerCase().includes(q) ||
        (c.descripcion ?? '').toLowerCase().includes(q) ||
        c.categoria.toLowerCase().includes(q);
      const coincideCategoria: boolean = categoria === '' || c.categoria === categoria;
      const coincideNivel: boolean = nivel === '' || c.nivel === nivel;
      return coincideTexto && coincideCategoria && coincideNivel;
    });
  }, [cursos, texto, categoria, nivel]);

  return (
    <>
      {/* Buscador */}
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="mx-auto -mt-2 flex w-full max-w-3xl flex-col gap-2 rounded-[2rem] bg-white p-2 shadow-card sm:flex-row sm:items-center"
      >
        <label className="flex flex-1 items-center gap-3 px-4 py-2">
          <span className="sr-only">Buscar un curso</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-petro-500" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscar un curso..."
            className="w-full bg-transparent text-sm text-night outline-none placeholder:text-slate-400"
          />
        </label>

        <label className="border-slate-100 px-4 sm:border-l">
          <span className="sr-only">Categoria</span>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-transparent py-2 text-sm font-semibold text-slate-600 outline-none">
            <option value="">Categoria</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="border-slate-100 px-4 sm:border-l">
          <span className="sr-only">Nivel</span>
          <select value={nivel} onChange={(e) => setNivel(e.target.value)} className="w-full bg-transparent py-2 text-sm font-semibold text-slate-600 outline-none">
            <option value="">Nivel</option>
            {NIVELES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>

        <button type="submit" className="cta sm:px-8">Buscar</button>
      </form>

      {/* Ilustracion */}
      {ilustracion && (
        <div className="-mx-6 mt-12 overflow-hidden px-6 sm:-mx-12 sm:px-12">
          <div className="mx-auto max-w-6xl">{ilustracion}</div>
        </div>
      )}

      {/* Grilla */}
      <motion.div
        variants={contenedor}
        initial="oculto"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filtrados.map((curso) => (
          <motion.article
            key={curso.id}
            variants={tarjeta}
            whileHover={{ y: -6 }}
            className="group relative flex flex-col rounded-[2rem] border border-slate-100 bg-white p-6 shadow-card transition"
          >
            <Link
              href={`/cursos/${curso.slug}`}
              className="absolute inset-0 z-10 rounded-[2rem]"
              aria-label={`Ver programa de ${curso.titulo}`}
            >
              <span className="sr-only">Ver programa de {curso.titulo}</span>
            </Link>

            <div className="mb-5 h-40 overflow-hidden rounded-3xl bg-gradient-to-br from-petro-50 to-petro-100 p-2">
              {curso.portada_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={curso.portada_url}
                  alt={`Portada del curso ${curso.titulo}`}
                  loading="lazy"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="grid h-full place-items-center">
                  <svg viewBox="0 0 64 64" className="h-16 w-16 text-petro-500" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
                    <path d="M32 8c8 9.5 13 17 13 23a13 13 0 1 1-26 0c0-6 5-13.5 13-23Z" strokeLinejoin="round" />
                    <path d="M32 26c3 4 4.6 6.6 4.6 8.8A4.6 4.6 0 0 1 32 39.4" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              <span className="chip">{curso.categoria}</span>
              <span className="chip bg-slate-100 text-slate-600">{curso.nivel}</span>
            </div>

            <h3 className="text-lg font-bold leading-snug text-night">{curso.titulo}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{curso.descripcion}</p>
            <p className="mt-3 text-xs font-semibold text-slate-400">
              {(asignaciones[curso.id] ?? []).map((id) => nombrePorId[id]).filter(Boolean)[0] ?? 'Equipo Cursoil'}
            </p>

            <footer className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs font-bold text-night underline decoration-petro-300 underline-offset-4 transition group-hover:text-petro-600">
                Ver programa
              </span>
              <span className="text-xs font-bold text-petro-600">{curso.duracion_horas} h</span>
            </footer>
          </motion.article>
        ))}

        {filtrados.length === 0 && (
          <p className="col-span-full rounded-[2rem] bg-white p-10 text-center text-sm font-semibold text-slate-500">
            No encontramos cursos con esos filtros. Prueba con otra categoria o nivel.
          </p>
        )}
      </motion.div>
    </>
  );
}
