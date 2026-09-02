'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';
import BotonSalir from './BotonSalir';
import type { SesionUsuario } from '@/lib/types';

const ENLACES: readonly { href: string; texto: string }[] = [
  { href: '#cursos', texto: 'Cursos' },
  { href: '#nosotros', texto: 'Nosotros' },
  { href: '#profesores', texto: 'Profesores' },
  { href: '#certificaciones', texto: 'Certificaciones' },
];

export default function Navbar({ sesion }: { sesion: SesionUsuario | null }) {
  const [abierto, setAbierto] = useState<boolean>(false);
  const panel: string = sesion?.rol === 'admin' ? '/admin' : '/profesor';

  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="sticky top-0 z-40 border-b border-white/60 bg-white/85 px-5 py-4 backdrop-blur-md sm:px-8"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6" aria-label="Navegacion principal">
        <Logo />

        <ul className="hidden items-center gap-8 lg:flex">
          {ENLACES.map((enlace) => (
            <li key={enlace.href}>
              <a
                href={enlace.href}
                className="text-sm font-semibold text-slate-600 transition hover:text-night"
              >
                {enlace.texto}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          {sesion ? (
            <>
              <span className="text-sm font-semibold text-slate-500">Hola, {sesion.nombre.split(' ')[0]}</span>
              {sesion.rol !== 'alumno' && (
                <Link href={panel} className="cta">
                  Mi panel
                </Link>
              )}
              <BotonSalir className="text-sm font-semibold text-slate-600 transition hover:text-night disabled:opacity-60" />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-slate-600 transition hover:text-night">
                Iniciar sesion
              </Link>
              <Link href="/register" className="cta">
                Registrarse
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 lg:hidden"
          aria-expanded={abierto}
          aria-label="Abrir menu"
        >
          <span className="space-y-1.5">
            <span className="block h-0.5 w-5 bg-night" />
            <span className="block h-0.5 w-5 bg-night" />
            <span className="block h-0.5 w-5 bg-night" />
          </span>
        </button>
      </nav>

      {abierto && (
        <motion.ul
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mx-auto mt-4 max-w-7xl space-y-2 overflow-hidden lg:hidden"
        >
          {ENLACES.map((enlace) => (
            <li key={enlace.href}>
              <a href={enlace.href} onClick={() => setAbierto(false)} className="block rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-petro-50">
                {enlace.texto}
              </a>
            </li>
          ))}
          {sesion ? (
            <li className="flex flex-col gap-2 pt-2">
              <span className="px-4 text-sm font-semibold text-slate-500">Hola, {sesion.nombre.split(' ')[0]}</span>
              <div className="flex gap-3">
                {sesion.rol !== 'alumno' && (
                  <Link href={panel} onClick={() => setAbierto(false)} className="cta flex-1">Mi panel</Link>
                )}
                <BotonSalir className="cta-suave flex-1" />
              </div>
            </li>
          ) : (
            <li className="flex gap-3 pt-2">
              <Link href="/login" className="cta-suave flex-1">Iniciar sesion</Link>
              <Link href="/register" className="cta flex-1">Registrarse</Link>
            </li>
          )}
        </motion.ul>
      )}
    </motion.header>
  );
}
