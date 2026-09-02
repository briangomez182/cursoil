'use client';

import { useMemo, useState, type ReactNode } from 'react';

export interface ModuloFiltrable {
  id: string;
  /** Texto sobre el que se filtra (titulo del modulo + descripcion + titulos de temas). */
  texto: string;
  nodo: ReactNode;
}

/** Filtro rapido para el listado de modulos y temas de un curso (vista de alumno y publica). */
export default function FiltroModulos({ modulos }: { modulos: ModuloFiltrable[] }) {
  const [consulta, setConsulta] = useState<string>('');
  const q: string = consulta.trim().toLowerCase();

  const visibles: ModuloFiltrable[] = useMemo(
    () => (q ? modulos.filter((m) => m.texto.toLowerCase().includes(q)) : modulos),
    [modulos, q],
  );

  return (
    <div className="space-y-8">
      {modulos.length > 1 && (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-card">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-petro-500" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Filtrar modulos y temas..."
            aria-label="Filtrar modulos y temas"
            className="w-full bg-transparent text-sm text-night outline-none placeholder:text-slate-400"
          />
          {q && (
            <span className="shrink-0 text-xs font-semibold text-slate-400">
              {visibles.length}/{modulos.length}
            </span>
          )}
        </div>
      )}

      {visibles.map((m) => (
        <div key={m.id}>{m.nodo}</div>
      ))}

      {visibles.length === 0 && (
        <p className="rounded-[2rem] bg-slate-50 p-8 text-center text-sm text-slate-500">
          Ningun modulo o tema coincide con &ldquo;{consulta}&rdquo;.
        </p>
      )}
    </div>
  );
}
