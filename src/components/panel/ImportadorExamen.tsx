'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { OpcionCampo } from './tipos';

interface Props {
  /** Opciones de modulo: [{ valor: id, etiqueta: titulo }]. */
  modulos: readonly OpcionCampo[];
  onCambio: () => void;
}

interface RespuestaImportar {
  ok?: boolean;
  insertadas?: number;
  reemplazadas?: boolean;
  modulo?: string;
  error?: string;
  detalles?: string[];
}

/** Ejemplo de archivo que se muestra y se puede descargar como plantilla. */
const EJEMPLO = {
  preguntas: [
    {
      enunciado: 'Cual es la funcion principal del lodo de perforacion?',
      opciones: [
        'Enfriar y lubricar la barrena, y llevar el recorte a superficie',
        'Generar energia electrica para el taladro',
        'Servir de combustible al motor',
        'Pintar la tuberia de revestimiento',
      ],
      correcta: 'a',
      orden: 1,
    },
    {
      enunciado: 'Que registro mide la resistividad de la formacion?',
      opciones: ['Gamma ray', 'Registro de induccion', 'Caliper', 'Registro sonico'],
      correcta: 'b',
      orden: 2,
    },
  ],
};

function contarPreguntas(json: unknown): number {
  const lista = Array.isArray(json)
    ? json
    : json && typeof json === 'object'
      ? (json as Record<string, unknown>).preguntas ?? (json as Record<string, unknown>).questions
      : undefined;
  return Array.isArray(lista) ? lista.length : 0;
}

export default function ImportadorExamen({ modulos, onCambio }: Props) {
  const [abierto, setAbierto] = useState<boolean>(false);
  const [moduloId, setModuloId] = useState<string>('');
  const [reemplazar, setReemplazar] = useState<boolean>(true);
  const [contenido, setContenido] = useState<unknown>(null);
  const [nombreArchivo, setNombreArchivo] = useState<string>('');
  const [conteo, setConteo] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [detalles, setDetalles] = useState<string[]>([]);
  const [exito, setExito] = useState<string>('');
  const [enviando, setEnviando] = useState<boolean>(false);

  function resetear(): void {
    setModuloId('');
    setReemplazar(true);
    setContenido(null);
    setNombreArchivo('');
    setConteo(0);
    setError('');
    setDetalles([]);
    setExito('');
  }

  async function alElegirArchivo(evento: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const archivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!archivo) return;
    setError('');
    setDetalles([]);
    setExito('');

    try {
      const json: unknown = JSON.parse(await archivo.text());
      const total = contarPreguntas(json);
      setContenido(json);
      setNombreArchivo(archivo.name);
      setConteo(total);
      if (total === 0) setError('No se detectaron preguntas. Revisa el formato del archivo.');
    } catch {
      setContenido(null);
      setNombreArchivo('');
      setConteo(0);
      setError('El archivo no es un JSON valido.');
    }
  }

  async function importar(): Promise<void> {
    setEnviando(true);
    setError('');
    setDetalles([]);
    setExito('');
    try {
      const respuesta = await fetch('/api/examenes/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modulo_id: moduloId, reemplazar, contenido }),
      });
      const datos = (await respuesta.json()) as RespuestaImportar;
      if (!respuesta.ok || !datos.ok) {
        setError(datos.error ?? 'No se pudo importar el examen.');
        setDetalles(Array.isArray(datos.detalles) ? datos.detalles : []);
        return;
      }
      setExito(
        `Se importaron ${datos.insertadas} preguntas en "${datos.modulo}"` +
          (datos.reemplazadas ? ' (se reemplazaron las anteriores).' : '.'),
      );
      onCambio();
      window.setTimeout(() => {
        setAbierto(false);
        resetear();
      }, 1400);
    } catch {
      setError('Error de red al importar. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  const ejemploTexto: string = JSON.stringify(EJEMPLO, null, 2);
  const ejemploHref = `data:application/json;charset=utf-8,${encodeURIComponent(ejemploTexto)}`;
  const puedeImportar: boolean = Boolean(moduloId) && Boolean(contenido) && conteo > 0 && !enviando;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          resetear();
          setAbierto(true);
        }}
        className="cta-suave"
      >
        Importar JSON
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-night/40 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Importar examen desde archivo JSON"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-8 shadow-soft"
            >
              <h3 className="text-xl font-extrabold text-night">Importar examen desde .json</h3>
              <p className="mt-1 text-sm text-slate-500">
                El archivo puede ser un arreglo de preguntas o un objeto con la clave <code>preguntas</code>. Cada
                pregunta necesita <code>enunciado</code>, 4 <code>opciones</code> y <code>correcta</code>
                (<code>&quot;a&quot;</code>&ndash;<code>&quot;d&quot;</code> o <code>1</code>&ndash;<code>4</code>).
                <code>orden</code> es opcional.
              </p>

              <div className="mt-5">
                <label className="etiqueta" htmlFor="importar-modulo">Modulo</label>
                <select
                  id="importar-modulo"
                  className="campo"
                  value={moduloId}
                  onChange={(e) => setModuloId(e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {modulos.map((m) => (
                    <option key={m.valor} value={m.valor}>{m.etiqueta}</option>
                  ))}
                </select>
              </div>

              <div className="mt-4">
                <label className="etiqueta" htmlFor="importar-archivo">Archivo JSON</label>
                <label
                  htmlFor="importar-archivo"
                  className="flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-petro-700 transition hover:border-petro-400 hover:bg-petro-50"
                >
                  {nombreArchivo ? `Archivo: ${nombreArchivo}` : 'Elegir archivo .json...'}
                  <input
                    id="importar-archivo"
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={(e) => void alElegirArchivo(e)}
                  />
                </label>
                {conteo > 0 && (
                  <p className="mt-1 text-xs font-semibold text-petro-600">{conteo} pregunta(s) detectada(s).</p>
                )}
              </div>

              <label className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={reemplazar}
                  onChange={(e) => setReemplazar(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-petro-600"
                />
                Reemplazar las preguntas actuales del modulo (si no, se agregan a las existentes)
              </label>

              <details className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
                <summary className="cursor-pointer font-bold text-night">Ver formato esperado</summary>
                <pre className="mt-3 overflow-x-auto rounded-xl bg-white p-3 font-mono text-[11px] leading-relaxed text-slate-700">
{ejemploTexto}
                </pre>
                <a
                  href={ejemploHref}
                  download="examen-ejemplo.json"
                  className="mt-2 inline-block font-bold text-petro-700 underline underline-offset-2"
                >
                  Descargar ejemplo
                </a>
              </details>

              {error && (
                <div role="alert" className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                  <p>{error}</p>
                  {detalles.length > 0 && (
                    <ul className="mt-2 list-disc space-y-0.5 pl-5 font-medium">
                      {detalles.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {exito && (
                <p className="mt-5 rounded-2xl bg-petro-50 px-4 py-3 text-sm font-semibold text-petro-700">{exito}</p>
              )}

              <div className="mt-7 flex justify-end gap-3">
                <button type="button" onClick={() => setAbierto(false)} className="cta-suave">Cancelar</button>
                <button type="button" onClick={() => void importar()} className="cta" disabled={!puedeImportar}>
                  {enviando ? 'Importando...' : conteo > 0 ? `Importar ${conteo} preguntas` : 'Importar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
