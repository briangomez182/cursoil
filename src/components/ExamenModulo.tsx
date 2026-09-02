'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LETRAS_OPCION,
  UMBRAL_APROBACION,
  type OpcionLetra,
  type PreguntaPublica,
  type ResultadoExamen,
} from '@/lib/types';

interface Props {
  moduloId: string;
  moduloTitulo: string;
  preguntas: PreguntaPublica[];
}

type Estado = 'inicio' | 'haciendo' | 'resultado';

function textoOpcion(pregunta: PreguntaPublica, letra: OpcionLetra): string {
  return String(pregunta[`opcion_${letra}` as keyof PreguntaPublica] ?? '');
}

export default function ExamenModulo({ moduloId, moduloTitulo, preguntas }: Props) {
  const ordenadas = useMemo(
    () => [...preguntas].sort((a, b) => a.orden - b.orden),
    [preguntas],
  );

  const [estado, setEstado] = useState<Estado>('inicio');
  const [respuestas, setRespuestas] = useState<Record<string, OpcionLetra>>({});
  const [resultado, setResultado] = useState<ResultadoExamen | null>(null);
  const [enviando, setEnviando] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const respondidas: number = Object.keys(respuestas).length;
  const completo: boolean = respondidas === ordenadas.length;
  const umbralPct: number = Math.round(UMBRAL_APROBACION * 100);

  function comenzar(): void {
    setRespuestas({});
    setResultado(null);
    setError('');
    setEstado('haciendo');
  }

  function elegir(preguntaId: string, letra: OpcionLetra): void {
    setRespuestas((r) => ({ ...r, [preguntaId]: letra }));
  }

  async function enviar(evento: React.FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault();
    setEnviando(true);
    setError('');
    try {
      const respuesta = await fetch('/api/examen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modulo_id: moduloId, respuestas }),
      });
      const datos = (await respuesta.json()) as ResultadoExamen & { error?: string };
      if (!respuesta.ok) {
        setError(datos.error ?? 'No se pudo corregir el examen.');
        return;
      }
      setResultado(datos);
      setEstado('resultado');
    } catch {
      setError('No se pudo enviar el examen. Revisa tu conexion.');
    } finally {
      setEnviando(false);
    }
  }

  const correctaPorPregunta: Record<string, OpcionLetra> = useMemo(() => {
    const mapa: Record<string, OpcionLetra> = {};
    resultado?.detalle.forEach((d) => {
      mapa[d.pregunta_id] = d.correcta;
    });
    return mapa;
  }, [resultado]);

  return (
    <section
      aria-labelledby={`examen-${moduloId}`}
      className="mt-8 rounded-[2rem] border border-petro-100 bg-petro-50/50 p-6 shadow-card sm:p-8"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="chip w-fit">Examen final del modulo</p>
          <h3 id={`examen-${moduloId}`} className="mt-3 text-lg font-extrabold tracking-tight text-night">
            {moduloTitulo}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {ordenadas.length} preguntas de opcion multiple &middot; se aprueba con {umbralPct}%.
          </p>
        </div>

        {estado === 'resultado' && resultado && (
          <span
            className={`rounded-2xl px-4 py-2 text-sm font-extrabold ${
              resultado.aprobado ? 'bg-petro-600 text-white' : 'bg-red-100 text-red-700'
            }`}
          >
            {resultado.puntaje} / {resultado.total} &middot; {resultado.aprobado ? 'Aprobado' : 'No aprobado'}
          </span>
        )}
      </header>

      <AnimatePresence mode="wait">
        {estado === 'inicio' && (
          <motion.div
            key="inicio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6"
          >
            <button type="button" onClick={comenzar} className="cta">
              Comenzar examen
            </button>
          </motion.div>
        )}

        {estado === 'haciendo' && (
          <motion.form
            key="haciendo"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onSubmit={enviar}
            className="mt-6 space-y-6"
          >
            {ordenadas.map((pregunta, indice) => (
              <fieldset key={pregunta.id} className="rounded-3xl bg-white p-5 shadow-card">
                <legend className="mb-3 text-sm font-bold text-night">
                  {indice + 1}. {pregunta.enunciado}
                </legend>
                <div className="space-y-2">
                  {LETRAS_OPCION.map((letra) => {
                    const seleccionada: boolean = respuestas[pregunta.id] === letra;
                    return (
                      <label
                        key={letra}
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                          seleccionada
                            ? 'border-petro-500 bg-petro-50 text-night'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-petro-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`pregunta-${pregunta.id}`}
                          value={letra}
                          checked={seleccionada}
                          onChange={() => elegir(pregunta.id, letra)}
                          className="mt-0.5 h-4 w-4 text-petro-600"
                        />
                        <span>
                          <strong className="mr-1 uppercase">{letra})</strong>
                          {textoOpcion(pregunta, letra)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            {error && (
              <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-500">
                {respondidas} / {ordenadas.length} respondidas
              </span>
              <div className="flex gap-3">
                <button type="button" onClick={() => setEstado('inicio')} className="cta-suave">
                  Cancelar
                </button>
                <button type="submit" className="cta" disabled={!completo || enviando}>
                  {enviando ? 'Corrigiendo...' : 'Enviar respuestas'}
                </button>
              </div>
            </div>
          </motion.form>
        )}

        {estado === 'resultado' && resultado && (
          <motion.div
            key="resultado"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 space-y-4"
          >
            {ordenadas.map((pregunta, indice) => {
              const elegida: OpcionLetra | undefined = respuestas[pregunta.id];
              const correcta: OpcionLetra | undefined = correctaPorPregunta[pregunta.id];
              const acerto: boolean = elegida === correcta;
              return (
                <div
                  key={pregunta.id}
                  className={`rounded-3xl border p-5 ${
                    acerto ? 'border-petro-200 bg-white' : 'border-red-200 bg-red-50/50'
                  }`}
                >
                  <p className="text-sm font-bold text-night">
                    {indice + 1}. {pregunta.enunciado}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Tu respuesta:{' '}
                    <strong className={acerto ? 'text-petro-700' : 'text-red-600'}>
                      {elegida ? `${elegida.toUpperCase()}) ${textoOpcion(pregunta, elegida)}` : 'Sin responder'}
                    </strong>
                  </p>
                  {!acerto && correcta && (
                    <p className="mt-1 text-sm text-slate-600">
                      Respuesta correcta:{' '}
                      <strong className="text-petro-700">
                        {correcta.toUpperCase()}) {textoOpcion(pregunta, correcta)}
                      </strong>
                    </p>
                  )}
                </div>
              );
            })}

            <button type="button" onClick={comenzar} className="cta">
              Reintentar examen
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
