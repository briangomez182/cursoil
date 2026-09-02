'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import GestorTabla from './GestorTabla';
import type { CampoConfig, OpcionCampo, Registro } from './tipos';
import { CATEGORIAS, NIVELES, TIPOS_ITEM, type Rol } from '@/lib/types';

type ClaveTab = 'profesores' | 'alumnos' | 'cursos' | 'modulos' | 'temas' | 'items' | 'examenes' | 'asignaciones';

interface Props {
  rol: Rol;
}

/** Boton inline para aceptar o suspender a un alumno desde la tabla (usa el campo `activo`). */
function BotonAceptar({ alumno, recargar }: { alumno: Registro; recargar: () => void }) {
  const [ocupado, setOcupado] = useState<boolean>(false);
  const activo: boolean = Boolean(alumno.activo);

  async function cambiar(valor: boolean): Promise<void> {
    setOcupado(true);
    await fetch(`/api/recursos/usuarios/${alumno.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: valor }),
    });
    setOcupado(false);
    recargar();
  }

  return (
    <button
      type="button"
      disabled={ocupado}
      onClick={() => void cambiar(!activo)}
      className={
        activo
          ? 'rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-amber-600 transition hover:bg-amber-50 disabled:opacity-50'
          : 'rounded-xl bg-petro-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-petro-700 disabled:opacity-50'
      }
    >
      {activo ? 'Suspender' : 'Aceptar'}
    </button>
  );
}

const CAMPOS_PROFESOR: readonly CampoConfig[] = [
  { nombre: 'nombre', etiqueta: 'Nombre completo', tipo: 'texto', requerido: true, ancho: 'mitad' },
  { nombre: 'usuario', etiqueta: 'Usuario', tipo: 'texto', requerido: true, ancho: 'mitad' },
  { nombre: 'email', etiqueta: 'Correo', tipo: 'texto', ancho: 'mitad' },
  { nombre: 'especialidad', etiqueta: 'Especialidad', tipo: 'texto', ancho: 'mitad' },
  { nombre: 'rol', etiqueta: 'Rol', tipo: 'select', ancho: 'mitad', requerido: true, opciones: [
    { valor: 'profesor', etiqueta: 'Profesor' },
    { valor: 'admin', etiqueta: 'Administrador' },
    { valor: 'alumno', etiqueta: 'Alumno' },
  ] },
  { nombre: 'telefono', etiqueta: 'Telefono', tipo: 'texto', ancho: 'mitad', enTabla: false },
  { nombre: 'bio', etiqueta: 'Biografia', tipo: 'textarea', enTabla: false },
  { nombre: 'password', etiqueta: 'Contrasena', tipo: 'password', enTabla: false, ancho: 'mitad', ayuda: 'Dejar vacio al editar para conservar la actual.' },
  { nombre: 'activo', etiqueta: 'Estado', tipo: 'booleano', ancho: 'mitad', enTabla: false },
];

const CAMPOS_ALUMNO: readonly CampoConfig[] = [
  { nombre: 'nombre', etiqueta: 'Nombre completo', tipo: 'texto', requerido: true, ancho: 'mitad' },
  { nombre: 'usuario', etiqueta: 'Usuario', tipo: 'texto', requerido: true, ancho: 'mitad' },
  { nombre: 'email', etiqueta: 'Correo', tipo: 'texto', ancho: 'mitad' },
  { nombre: 'telefono', etiqueta: 'Telefono', tipo: 'texto', ancho: 'mitad', enTabla: false },
  { nombre: 'activo', etiqueta: 'Aceptado', tipo: 'booleano', ancho: 'mitad', enTabla: false, ayuda: 'Activo = el alumno puede iniciar sesion y ver los cursos.' },
  { nombre: 'password', etiqueta: 'Contrasena', tipo: 'password', enTabla: false, ancho: 'mitad', ayuda: 'Dejar vacio al editar para conservar la actual.' },
];

const CAMPOS_CURSO: readonly CampoConfig[] = [
  { nombre: 'titulo', etiqueta: 'Titulo', tipo: 'texto', requerido: true },
  { nombre: 'slug', etiqueta: 'Slug (URL)', tipo: 'texto', requerido: true, ancho: 'mitad', placeholder: 'fundamentos-perforacion' },
  { nombre: 'categoria', etiqueta: 'Categoria', tipo: 'select', ancho: 'mitad', requerido: true, opciones: CATEGORIAS.map((c) => ({ valor: c, etiqueta: c })) },
  { nombre: 'nivel', etiqueta: 'Nivel', tipo: 'select', ancho: 'mitad', requerido: true, opciones: NIVELES.map((n) => ({ valor: n, etiqueta: n })) },
  { nombre: 'duracion_horas', etiqueta: 'Duracion (horas)', tipo: 'numero', ancho: 'mitad' },
  { nombre: 'descripcion', etiqueta: 'Descripcion', tipo: 'textarea', enTabla: false },
  { nombre: 'portada_url', etiqueta: 'Imagen de portada', tipo: 'imagen', enTabla: false, ayuda: 'Se muestra en la tarjeta del curso en la home. Se guarda en el bucket publico "portadas" de Supabase.' },
  { nombre: 'publicado', etiqueta: 'Publicado', tipo: 'booleano', ancho: 'mitad', enTabla: false },
];

const CAMPOS_MODULO: readonly CampoConfig[] = [
  { nombre: 'titulo', etiqueta: 'Titulo del modulo', tipo: 'texto', requerido: true },
  { nombre: 'curso_id', etiqueta: 'Curso', tipo: 'select', relacion: 'cursos', requerido: true, ancho: 'mitad' },
  { nombre: 'orden', etiqueta: 'Orden', tipo: 'numero', ancho: 'mitad' },
  { nombre: 'descripcion', etiqueta: 'Descripcion', tipo: 'textarea', enTabla: false },
];

const CAMPOS_TEMA: readonly CampoConfig[] = [
  { nombre: 'titulo', etiqueta: 'Titulo del tema', tipo: 'texto', requerido: true },
  { nombre: 'modulo_id', etiqueta: 'Modulo', tipo: 'select', relacion: 'modulos', requerido: true, ancho: 'mitad' },
  { nombre: 'orden', etiqueta: 'Orden', tipo: 'numero', ancho: 'mitad' },
  { nombre: 'descripcion', etiqueta: 'Descripcion', tipo: 'textarea', enTabla: false },
];

const CAMPOS_ITEM: readonly CampoConfig[] = [
  { nombre: 'titulo', etiqueta: 'Titulo del item', tipo: 'texto', requerido: true },
  { nombre: 'tema_id', etiqueta: 'Tema', tipo: 'select', relacion: 'temas', requerido: true, ancho: 'mitad' },
  { nombre: 'tipo', etiqueta: 'Formato', tipo: 'select', ancho: 'mitad', requerido: true, opciones: TIPOS_ITEM.map((t) => ({ valor: t.valor, etiqueta: t.etiqueta })) },
  { nombre: 'url', etiqueta: 'URL embebida', tipo: 'texto', ayuda: 'Google Slides /embed, YouTube /embed o Vimeo. Solo para presentacion y video.' },
  { nombre: 'contenido', etiqueta: 'Contenido (Markdown / HTML)', tipo: 'markdown', enTabla: false, ayuda: 'Solo para items de tipo documento.' },
  { nombre: 'duracion_min', etiqueta: 'Duracion (min)', tipo: 'numero', ancho: 'mitad', enTabla: false },
  { nombre: 'orden', etiqueta: 'Orden', tipo: 'numero', ancho: 'mitad', enTabla: false },
];

const CAMPOS_PREGUNTA: readonly CampoConfig[] = [
  { nombre: 'modulo_id', etiqueta: 'Modulo', tipo: 'select', relacion: 'modulos', requerido: true },
  { nombre: 'enunciado', etiqueta: 'Pregunta', tipo: 'textarea', requerido: true },
  { nombre: 'opcion_a', etiqueta: 'Opcion A', tipo: 'texto', requerido: true, ancho: 'mitad', enTabla: false },
  { nombre: 'opcion_b', etiqueta: 'Opcion B', tipo: 'texto', requerido: true, ancho: 'mitad', enTabla: false },
  { nombre: 'opcion_c', etiqueta: 'Opcion C', tipo: 'texto', requerido: true, ancho: 'mitad', enTabla: false },
  { nombre: 'opcion_d', etiqueta: 'Opcion D', tipo: 'texto', requerido: true, ancho: 'mitad', enTabla: false },
  { nombre: 'correcta', etiqueta: 'Respuesta correcta', tipo: 'select', ancho: 'mitad', requerido: true, opciones: [
    { valor: 'a', etiqueta: 'A' },
    { valor: 'b', etiqueta: 'B' },
    { valor: 'c', etiqueta: 'C' },
    { valor: 'd', etiqueta: 'D' },
  ], ayuda: 'No se muestra al alumno; solo se usa para corregir.' },
  { nombre: 'orden', etiqueta: 'Orden (1-10)', tipo: 'numero', ancho: 'mitad' },
];

const CAMPOS_ASIGNACION: readonly CampoConfig[] = [
  { nombre: 'curso_id', etiqueta: 'Curso', tipo: 'select', relacion: 'cursos', requerido: true, ancho: 'mitad' },
  { nombre: 'profesor_id', etiqueta: 'Profesor', tipo: 'select', relacion: 'usuarios', requerido: true, ancho: 'mitad' },
];

const TABS_ADMIN: readonly { clave: ClaveTab; etiqueta: string }[] = [
  { clave: 'profesores', etiqueta: 'Profesores' },
  { clave: 'alumnos', etiqueta: 'Alumnos' },
  { clave: 'cursos', etiqueta: 'Cursos' },
  { clave: 'modulos', etiqueta: 'Modulos' },
  { clave: 'temas', etiqueta: 'Temas' },
  { clave: 'items', etiqueta: 'Items' },
  { clave: 'examenes', etiqueta: 'Examenes' },
  { clave: 'asignaciones', etiqueta: 'Asignaciones' },
];

const TABS_PROFESOR: readonly { clave: ClaveTab; etiqueta: string }[] = [
  { clave: 'modulos', etiqueta: 'Modulos' },
  { clave: 'temas', etiqueta: 'Temas' },
  { clave: 'items', etiqueta: 'Items' },
  { clave: 'examenes', etiqueta: 'Examenes' },
  { clave: 'cursos', etiqueta: 'Mis cursos' },
];

export default function PanelGestion({ rol }: Props) {
  const tabs = rol === 'admin' ? TABS_ADMIN : TABS_PROFESOR;
  const [tab, setTab] = useState<ClaveTab>(tabs[0].clave);
  const [datos, setDatos] = useState<Record<string, Registro[]>>({
    usuarios: [], cursos: [], modulos: [], temas: [], items: [], curso_profesores: [], preguntas: [],
  });
  const [aviso, setAviso] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(true);

  const cargar = useCallback(async (): Promise<void> => {
    const tablas: readonly string[] = ['usuarios', 'cursos', 'modulos', 'temas', 'items', 'curso_profesores', 'preguntas'];
    const respuestas = await Promise.all(
      tablas.map(async (t) => {
        const r = await fetch(`/api/recursos/${t}`, { cache: 'no-store' });
        const j = (await r.json()) as { datos?: Registro[]; aviso?: string };
        return [t, j] as const;
      }),
    );
    const nuevo: Record<string, Registro[]> = {};
    let mensaje = '';
    respuestas.forEach(([t, j]) => {
      nuevo[t] = j.datos ?? [];
      if (j.aviso) mensaje = j.aviso;
    });
    setDatos(nuevo);
    setAviso(mensaje);
    setCargando(false);
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const relaciones: Record<string, readonly OpcionCampo[]> = useMemo(
    () => ({
      curso_id: datos.cursos.map((c) => ({ valor: c.id, etiqueta: String(c.titulo) })),
      modulo_id: datos.modulos.map((m) => ({ valor: m.id, etiqueta: String(m.titulo) })),
      tema_id: datos.temas.map((t) => ({ valor: t.id, etiqueta: String(t.titulo) })),
      profesor_id: datos.usuarios.filter((u) => u.rol === 'profesor').map((u) => ({ valor: u.id, etiqueta: String(u.nombre) })),
    }),
    [datos],
  );

  const profesores: Registro[] = useMemo(
    () => (rol === 'admin' ? datos.usuarios.filter((u) => u.rol !== 'alumno') : []),
    [datos.usuarios, rol],
  );

  const alumnos: Registro[] = useMemo(
    () => (rol === 'admin' ? datos.usuarios.filter((u) => u.rol === 'alumno') : []),
    [datos.usuarios, rol],
  );

  const cursoPorModulo = useCallback(
    (moduloId: unknown): string => {
      const modulo = datos.modulos.find((m) => m.id === moduloId);
      const curso = modulo ? datos.cursos.find((c) => c.id === modulo.curso_id) : null;
      return curso ? String(curso.titulo) : '-';
    },
    [datos.modulos, datos.cursos],
  );

  const cursoPorTema = useCallback(
    (temaId: unknown): string => {
      const tema = datos.temas.find((t) => t.id === temaId);
      return tema ? cursoPorModulo(tema.modulo_id) : '-';
    },
    [datos.temas, cursoPorModulo],
  );

  const paneles: Record<ClaveTab, JSX.Element> = {
    profesores: (
      <GestorTabla titulo="Profesores y administradores" descripcion="Alta, edicion y baja del equipo docente."
        tabla="usuarios" campos={CAMPOS_PROFESOR} registros={profesores} relaciones={relaciones} onCambio={() => void cargar()} />
    ),
    alumnos: (
      <GestorTabla titulo="Alumnos" descripcion="El alumno confirma su correo y luego el administrador acepta su acceso a los cursos."
        tabla="usuarios" campos={CAMPOS_ALUMNO} registros={alumnos} relaciones={relaciones} onCambio={() => void cargar()}
        columnasExtra={[
          { etiqueta: 'Correo', render: (r) => (r.correo_confirmado ? 'Confirmado' : 'Sin confirmar') },
          { etiqueta: 'Estado', render: (r) => (r.activo ? 'Aceptado' : 'Pendiente') },
        ]}
        accionRapida={(r, recargar) => <BotonAceptar alumno={r} recargar={recargar} />} />
    ),
    cursos: (
      <GestorTabla titulo="Cursos" descripcion="Catalogo principal de la plataforma."
        tabla="cursos" campos={CAMPOS_CURSO} registros={datos.cursos} relaciones={relaciones} onCambio={() => void cargar()} soloLectura={rol !== 'admin'} />
    ),
    modulos: (
      <GestorTabla titulo="Modulos" descripcion="Cada curso se divide en modulos ordenados."
        tabla="modulos" campos={CAMPOS_MODULO} registros={datos.modulos} relaciones={relaciones} onCambio={() => void cargar()} />
    ),
    temas: (
      <GestorTabla titulo="Temas" descripcion="Los temas agrupan los items de contenido dentro de un modulo."
        tabla="temas" campos={CAMPOS_TEMA} registros={datos.temas} relaciones={relaciones} onCambio={() => void cargar()}
        columnasExtra={[{ etiqueta: 'Curso', render: (r) => cursoPorModulo(r.modulo_id) }]} />
    ),
    items: (
      <GestorTabla titulo="Items de contenido" descripcion="Presentaciones de Google Slides, documentos enriquecidos y videos."
        tabla="items" campos={CAMPOS_ITEM} registros={datos.items} relaciones={relaciones} onCambio={() => void cargar()}
        columnasExtra={[{ etiqueta: 'Curso', render: (r) => cursoPorTema(r.tema_id) }]} />
    ),
    examenes: (
      <GestorTabla titulo="Examenes de modulo" descripcion="Examen final por modulo: 10 preguntas de opcion multiple. La respuesta correcta nunca se envia al alumno."
        tabla="preguntas" campos={CAMPOS_PREGUNTA} registros={datos.preguntas} relaciones={relaciones} onCambio={() => void cargar()}
        columnasExtra={[
          { etiqueta: 'Curso', render: (r) => cursoPorModulo(r.modulo_id) },
          { etiqueta: 'Correcta', render: (r) => String(r.correcta ?? '-').toUpperCase() },
        ]} />
    ),
    asignaciones: (
      <GestorTabla titulo="Asignacion de profesores" descripcion="Vincula cada curso con sus profesores responsables."
        tabla="curso_profesores" campos={CAMPOS_ASIGNACION} registros={datos.curso_profesores} relaciones={relaciones} onCambio={() => void cargar()} />
    ),
  };

  return (
    <div>
      {aviso && (
        <p className="mb-6 rounded-2xl bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-700">
          {aviso}
        </p>
      )}

      <nav className="mb-6 flex flex-wrap gap-2" aria-label="Secciones del panel">
        {tabs.map((t) => (
          <button
            key={t.clave}
            type="button"
            onClick={() => setTab(t.clave)}
            aria-current={tab === t.clave}
            className={`rounded-2xl px-5 py-2.5 text-sm font-bold transition ${
              tab === t.clave ? 'bg-night text-white' : 'bg-white text-slate-500 hover:text-night'
            }`}
          >
            {t.etiqueta}
          </button>
        ))}
      </nav>

      {cargando ? (
        <p className="rounded-[2rem] bg-white p-10 text-center text-sm font-semibold text-slate-400">Cargando datos...</p>
      ) : (
        <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {paneles[tab]}
        </motion.div>
      )}
    </div>
  );
}
