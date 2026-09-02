'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Item } from '@/lib/types';

/** Conversion minima de Markdown a HTML para los items de tipo documento. */
function markdownAHtml(texto: string): string {
  if (/<[a-z][\s\S]*>/i.test(texto)) return texto;
  return texto
    .split(/\n{2,}/)
    .map((bloque) => {
      const linea: string = bloque.trim();
      if (linea.startsWith('### ')) return `<h3>${linea.slice(4)}</h3>`;
      if (linea.startsWith('## ')) return `<h2>${linea.slice(3)}</h2>`;
      if (linea.startsWith('# ')) return `<h1>${linea.slice(2)}</h1>`;
      if (linea.startsWith('- ')) {
        const puntos: string = linea
          .split('\n')
          .map((l) => `<li>${l.replace(/^-\s*/, '')}</li>`)
          .join('');
        return `<ul>${puntos}</ul>`;
      }
      return `<p>${linea.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />')}</p>`;
    })
    .join('');
}

const ICONOS: Record<Item['tipo'], string> = {
  presentacion: 'Presentacion',
  documento: 'Documento',
  video: 'Video',
};

export default function VisorItem({ items }: { items: Item[] }) {
  const [activo, setActivo] = useState<number>(0);
  const item: Item | undefined = items[activo];

  if (!item) {
    return (
      <p className="rounded-[2rem] bg-white p-10 text-center text-sm text-slate-500">
        Este tema aun no tiene contenido publicado.
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-2" aria-label="Contenido del tema">
        {items.map((it, i) => (
          <button
            key={it.id}
            type="button"
            onClick={() => setActivo(i)}
            className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
              i === activo ? 'bg-night text-white' : 'bg-white text-slate-600 hover:bg-petro-50'
            }`}
          >
            <span className={`block text-[10px] font-bold uppercase tracking-wider ${i === activo ? 'text-petro-300' : 'text-petro-500'}`}>
              {ICONOS[it.tipo]}
            </span>
            <span className="font-semibold">{it.titulo}</span>
          </button>
        ))}
      </aside>

      <motion.article key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded-[2rem] bg-white p-6 shadow-card sm:p-8">
        <header className="mb-5">
          <span className="chip">{ICONOS[item.tipo]} - {item.duracion_min} min</span>
          <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-night">{item.titulo}</h3>
        </header>

        {item.tipo === 'documento' ? (
          <div
            className="prose-petro space-y-3 text-sm leading-relaxed text-slate-600 [&_h1]:text-xl [&_h1]:font-extrabold [&_h1]:text-night [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-night [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-night"
            dangerouslySetInnerHTML={{ __html: markdownAHtml(item.contenido ?? '') }}
          />
        ) : item.url ? (
          <div className="aspect-video w-full overflow-hidden rounded-3xl bg-petro-50">
            <iframe
              src={item.url}
              title={item.titulo}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        ) : (
          <p className="text-sm text-slate-500">Este item no tiene una URL configurada.</p>
        )}
      </motion.article>
    </div>
  );
}
