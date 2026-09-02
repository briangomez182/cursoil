import Link from 'next/link';
import type { ReactNode } from 'react';
import Logo from './Logo';
import { PLATAFORMA } from '@/lib/config';

interface Props {
  titulo: string;
  subtitulo: string;
  children: ReactNode;
  pie: ReactNode;
}

export default function MarcoAuth({ titulo, subtitulo, children, pie }: Props) {
  return (
    <div className="grid min-h-screen place-items-center bg-white px-4 py-10">
      <main className="w-full max-w-5xl overflow-hidden bg-white lg:grid lg:grid-cols-2">
        <section className="p-8 sm:p-12">
          <Logo />
          <h1 className="mt-10 text-3xl font-extrabold tracking-tight text-night">{titulo}</h1>
          <p className="mt-2 text-sm text-slate-500">{subtitulo}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-sm text-slate-500">{pie}</div>
        </section>

        <aside className="hidden bg-gradient-to-br from-petro-100 via-petro-50 to-white p-12 lg:flex lg:flex-col lg:justify-between">
          <svg viewBox="0 0 200 140" className="w-full text-petro-500" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
            <path d="M10 120h180" strokeLinecap="round" />
            <path d="M30 120V60l26-16v76" strokeLinejoin="round" />
            <path d="M56 44 30 60" />
            <rect x="80" y="72" width="46" height="48" rx="6" />
            <path d="M103 60c6 7 10 12 10 16a10 10 0 1 1-20 0c0-4 4-9 10-16Z" strokeLinejoin="round" />
            <path d="M140 120V50m0 0-12 14m12-14 12 14" strokeLinejoin="round" />
            <path d="M168 120V78h18v42" strokeLinejoin="round" />
          </svg>

          <blockquote className="mt-10">
            <p className="text-lg font-bold leading-snug text-night">
              &ldquo;La formacion tecnica es el activo que ningun barril reemplaza.&rdquo;
            </p>
            <footer className="mt-3 text-sm font-semibold text-petro-600">
              Equipo Cursoil - {PLATAFORMA.ciudad}, {PLATAFORMA.pais}
            </footer>
          </blockquote>

          <Link href="/" className="mt-10 text-sm font-semibold text-slate-500 transition hover:text-night">
            &larr; Volver al inicio
          </Link>
        </aside>
      </main>
    </div>
  );
}
