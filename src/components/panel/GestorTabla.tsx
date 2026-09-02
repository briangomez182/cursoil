'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CampoConfig, OpcionCampo, Registro } from './tipos';

/** Campo de imagen: sube el archivo al bucket de Supabase y guarda la URL publica resultante. */
function CampoImagen({
  id,
  valor,
  carpeta,
  onCambio,
}: {
  id: string;
  valor: string;
  carpeta: string;
  onCambio: (url: string) => void;
}) {
  const [subiendo, setSubiendo] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  async function alElegir(evento: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const archivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!archivo) return;

    setSubiendo(true);
    setError('');
    const cuerpo = new FormData();
    cuerpo.append('file', archivo);
    cuerpo.append('carpeta', carpeta);

    try {
      const respuesta = await fetch('/api/uploads', { method: 'POST', body: cuerpo });
      const datos = (await respuesta.json()) as { url?: string; error?: string };
      if (!respuesta.ok || !datos.url) {
        setError(datos.error ?? 'No se pudo subir la imagen.');
        return;
      }
      onCambio(datos.url);
    } catch {
      setError('No se pudo subir la imagen. Revisa tu conexion.');
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 p-3">
      {valor ? (
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={valor} alt="Vista previa de la portada" className="h-20 w-32 shrink-0 rounded-xl object-cover" />
          <button
            type="button"
            onClick={() => onCambio('')}
            className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-50"
          >
            Quitar
          </button>
        </div>
      ) : (
        <p className="text-xs text-slate-400">Aun no hay imagen cargada.</p>
      )}

      <label
        htmlFor={id}
        className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-petro-50 px-4 py-2 text-xs font-bold text-petro-700 transition hover:bg-petro-100 aria-disabled:opacity-60"
        aria-disabled={subiendo}
      >
        {subiendo ? 'Subiendo...' : valor ? 'Reemplazar imagen' : 'Subir imagen'}
        <input
          id={id}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={subiendo}
          onChange={(e) => void alElegir(e)}
        />
      </label>

      <input
        type="url"
        value={valor}
        placeholder="o pega una URL de imagen"
        onChange={(e) => onCambio(e.target.value)}
        className="campo mt-2 text-xs"
      />

      {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}

interface Props {
  titulo: string;
  descripcion: string;
  tabla: string;
  campos: readonly CampoConfig[];
  registros: Registro[];
  /** Opciones para campos con relacion: { curso_id: [{valor, etiqueta}] } */
  relaciones: Record<string, readonly OpcionCampo[]>;
  onCambio: () => void;
  soloLectura?: boolean;
  /** Columnas adicionales de solo lectura, calculadas fuera del formulario (p. ej. curso al que pertenece). */
  columnasExtra?: readonly { etiqueta: string; render: (registro: Registro) => string }[];
  /** Boton de accion rapida por fila (p. ej. aceptar/suspender un alumno). Recibe una funcion para recargar. */
  accionRapida?: (registro: Registro, recargar: () => void) => ReactNode;
}

function valorInicial(campos: readonly CampoConfig[]): Record<string, unknown> {
  const base: Record<string, unknown> = {};
  campos.forEach((campo) => {
    base[campo.nombre] = campo.tipo === 'booleano' ? true : campo.tipo === 'numero' ? 1 : '';
  });
  return base;
}

export default function GestorTabla({ titulo, descripcion, tabla, campos, registros, relaciones, onCambio, soloLectura = false, columnasExtra = [], accionRapida }: Props) {
  const [abierto, setAbierto] = useState<boolean>(false);
  const [editando, setEditando] = useState<Registro | null>(null);
  const [formulario, setFormulario] = useState<Record<string, unknown>>(() => valorInicial(campos));
  const [error, setError] = useState<string>('');
  const [guardando, setGuardando] = useState<boolean>(false);

  const columnas: CampoConfig[] = useMemo(() => campos.filter((c) => c.enTabla !== false).slice(0, 4), [campos]);

  function opcionesDe(campo: CampoConfig): readonly OpcionCampo[] {
    if (campo.relacion) return relaciones[campo.nombre] ?? [];
    return campo.opciones ?? [];
  }

  function abrirNuevo(): void {
    setEditando(null);
    setFormulario(valorInicial(campos));
    setError('');
    setAbierto(true);
  }

  function abrirEdicion(registro: Registro): void {
    const base: Record<string, unknown> = {};
    campos.forEach((campo) => {
      const valor = registro[campo.nombre];
      base[campo.nombre] = campo.tipo === 'password' ? '' : (valor ?? (campo.tipo === 'booleano' ? false : ''));
    });
    setEditando(registro);
    setFormulario(base);
    setError('');
    setAbierto(true);
  }

  async function guardar(evento: React.FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault();
    setGuardando(true);
    setError('');

    const ruta: string = editando ? `/api/recursos/${tabla}/${editando.id}` : `/api/recursos/${tabla}`;
    const respuesta = await fetch(ruta, {
      method: editando ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formulario),
    });
    const datos = (await respuesta.json()) as { error?: string };
    setGuardando(false);

    if (!respuesta.ok) {
      setError(datos.error ?? 'No se pudo guardar.');
      return;
    }
    setAbierto(false);
    onCambio();
  }

  async function eliminar(registro: Registro): Promise<void> {
    const respuesta = await fetch(`/api/recursos/${tabla}/${registro.id}`, { method: 'DELETE' });
    if (respuesta.ok) onCambio();
  }

  function mostrar(registro: Registro, campo: CampoConfig): string {
    const valor = registro[campo.nombre];
    if (campo.tipo === 'booleano') return valor ? 'Si' : 'No';
    if (campo.relacion || campo.opciones) {
      const opcion = opcionesDe(campo).find((o) => o.valor === String(valor));
      if (opcion) return opcion.etiqueta;
    }
    const texto: string = valor === null || valor === undefined ? '-' : String(valor);
    return texto.length > 70 ? `${texto.slice(0, 70)}...` : texto;
  }

  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-card sm:p-8" aria-labelledby={`titulo-${tabla}`}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id={`titulo-${tabla}`} className="text-xl font-extrabold tracking-tight text-night">{titulo}</h2>
          <p className="mt-1 text-sm text-slate-500">{descripcion}</p>
        </div>
        {!soloLectura && (
          <button type="button" onClick={abrirNuevo} className="cta">
            + Nuevo
          </button>
        )}
      </header>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] border-separate border-spacing-y-2 text-left">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-slate-400">
              {columnas.map((c) => (
                <th key={c.nombre} className="px-4 pb-1 font-bold">{c.etiqueta}</th>
              ))}
              {columnasExtra.map((c) => (
                <th key={c.etiqueta} className="px-4 pb-1 font-bold">{c.etiqueta}</th>
              ))}
              <th className="px-4 pb-1 text-right font-bold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((registro) => (
              <tr key={registro.id} className="bg-petro-50/60 text-sm text-night">
                {columnas.map((c, i) => (
                  <td key={c.nombre} className={`px-4 py-3 ${i === 0 ? 'rounded-l-2xl font-semibold' : 'text-slate-600'}`}>
                    {mostrar(registro, c)}
                  </td>
                ))}
                {columnasExtra.map((c) => (
                  <td key={c.etiqueta} className="px-4 py-3 text-slate-600">
                    {c.render(registro)}
                  </td>
                ))}
                <td className="rounded-r-2xl px-4 py-3 text-right">
                  <div className="inline-flex flex-wrap justify-end gap-2">
                    {accionRapida?.(registro, onCambio)}
                    <button type="button" onClick={() => abrirEdicion(registro)} className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-petro-700 transition hover:bg-petro-100">
                      Editar
                    </button>
                    {!soloLectura && (
                      <button type="button" onClick={() => void eliminar(registro)} className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-50">
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {registros.length === 0 && (
              <tr>
                <td colSpan={columnas.length + columnasExtra.length + 1} className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  Aun no hay registros. Crea el primero con el boton &ldquo;Nuevo&rdquo;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-night/40 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <motion.form
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              onSubmit={guardar}
              className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-8 shadow-soft"
            >
              <h3 className="text-xl font-extrabold text-night">
                {editando ? 'Editar registro' : `Nuevo en ${titulo.toLowerCase()}`}
              </h3>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {campos.map((campo) => {
                  const claseAncho: string = campo.ancho === 'mitad' ? 'sm:col-span-1' : 'sm:col-span-2';
                  const valor = formulario[campo.nombre];

                  return (
                    <div key={campo.nombre} className={claseAncho}>
                      <label className="etiqueta" htmlFor={`${tabla}-${campo.nombre}`}>{campo.etiqueta}</label>

                      {campo.tipo === 'textarea' || campo.tipo === 'markdown' ? (
                        <textarea
                          id={`${tabla}-${campo.nombre}`}
                          className="campo min-h-[120px] font-mono text-xs"
                          value={String(valor ?? '')}
                          placeholder={campo.placeholder}
                          onChange={(e) => setFormulario((f) => ({ ...f, [campo.nombre]: e.target.value }))}
                        />
                      ) : campo.tipo === 'imagen' ? (
                        <CampoImagen
                          id={`${tabla}-${campo.nombre}`}
                          valor={String(valor ?? '')}
                          carpeta={tabla}
                          onCambio={(url) => setFormulario((f) => ({ ...f, [campo.nombre]: url }))}
                        />
                      ) : campo.tipo === 'select' ? (
                        <select
                          id={`${tabla}-${campo.nombre}`}
                          className="campo"
                          value={String(valor ?? '')}
                          required={campo.requerido}
                          onChange={(e) => setFormulario((f) => ({ ...f, [campo.nombre]: e.target.value }))}
                        >
                          <option value="">Seleccionar...</option>
                          {opcionesDe(campo).map((o) => (
                            <option key={o.valor} value={o.valor}>{o.etiqueta}</option>
                          ))}
                        </select>
                      ) : campo.tipo === 'booleano' ? (
                        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600">
                          <input
                            id={`${tabla}-${campo.nombre}`}
                            type="checkbox"
                            checked={Boolean(valor)}
                            onChange={(e) => setFormulario((f) => ({ ...f, [campo.nombre]: e.target.checked }))}
                            className="h-4 w-4 rounded border-slate-300 text-petro-600"
                          />
                          Activo
                        </label>
                      ) : (
                        <input
                          id={`${tabla}-${campo.nombre}`}
                          type={campo.tipo === 'numero' ? 'number' : campo.tipo === 'password' ? 'password' : 'text'}
                          className="campo"
                          value={String(valor ?? '')}
                          placeholder={campo.placeholder}
                          required={campo.requerido}
                          onChange={(e) =>
                            setFormulario((f) => ({
                              ...f,
                              [campo.nombre]: campo.tipo === 'numero' ? Number(e.target.value) : e.target.value,
                            }))
                          }
                        />
                      )}

                      {campo.ayuda && <p className="mt-1 text-xs text-slate-400">{campo.ayuda}</p>}
                    </div>
                  );
                })}
              </div>

              {error && <p role="alert" className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}

              <div className="mt-7 flex justify-end gap-3">
                <button type="button" onClick={() => setAbierto(false)} className="cta-suave">Cancelar</button>
                <button type="submit" className="cta" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
