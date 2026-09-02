export const REGISTROS_POR_PAGINA = 20;

interface Props {
  pagina: number;
  totalPaginas: number;
  onCambiar: (pagina: number) => void;
}

/** Construye la lista compacta de paginas a mostrar, con "..." cuando hay muchas. */
function construirPaginas(pagina: number, total: number): readonly (number | '...')[] {
  const paginas: (number | '...')[] = [1];

  const inicio: number = Math.max(2, pagina - 1);
  const fin: number = Math.min(total - 1, pagina + 1);

  if (inicio > 2) paginas.push('...');
  for (let i = inicio; i <= fin; i += 1) paginas.push(i);
  if (fin < total - 1) paginas.push('...');
  if (total > 1) paginas.push(total);

  return paginas;
}

/** Paginacion de 3 partes: pagina anterior, listado de paginas, pagina siguiente. */
export default function Paginacion({ pagina, totalPaginas, onCambiar }: Props) {
  if (totalPaginas <= 1) return null;

  const paginas: readonly (number | '...')[] = construirPaginas(pagina, totalPaginas);

  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Paginacion">
      <button
        type="button"
        onClick={() => onCambiar(pagina - 1)}
        disabled={pagina === 1}
        className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-card transition hover:text-night disabled:cursor-not-allowed disabled:opacity-40"
      >
        Anterior
      </button>

      <ul className="flex items-center gap-1">
        {paginas.map((p, i) =>
          p === '...' ? (
            <li key={`puntos-${i}`} className="px-1 text-sm text-slate-400" aria-hidden="true">
              &hellip;
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                onClick={() => onCambiar(p)}
                aria-current={p === pagina ? 'page' : undefined}
                className={`grid h-9 w-9 place-items-center rounded-xl text-sm font-bold transition ${
                  p === pagina ? 'bg-night text-white' : 'bg-white text-slate-600 hover:bg-petro-50'
                }`}
              >
                {p}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        onClick={() => onCambiar(pagina + 1)}
        disabled={pagina === totalPaginas}
        className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-card transition hover:text-night disabled:cursor-not-allowed disabled:opacity-40"
      >
        Siguiente
      </button>
    </nav>
  );
}
