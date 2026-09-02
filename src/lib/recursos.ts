import 'server-only';
import type { Rol } from './types';

export type Tabla = 'usuarios' | 'cursos' | 'modulos' | 'temas' | 'items' | 'curso_profesores' | 'inscripciones';

interface Definicion {
  campos: readonly string[];
  orden: string;
  /** Roles autorizados a escribir en la tabla. */
  escritura: readonly Rol[];
}

export const RECURSOS: Record<Tabla, Definicion> = {
  usuarios: {
    campos: ['usuario', 'email', 'nombre', 'rol', 'especialidad', 'bio', 'avatar_url', 'telefono', 'activo', 'password'],
    orden: 'creado_en',
    escritura: ['admin'],
  },
  cursos: {
    campos: ['titulo', 'slug', 'descripcion', 'categoria', 'nivel', 'duracion_horas', 'portada_url', 'publicado'],
    orden: 'creado_en',
    escritura: ['admin'],
  },
  modulos: {
    campos: ['curso_id', 'titulo', 'descripcion', 'orden'],
    orden: 'orden',
    escritura: ['admin', 'profesor'],
  },
  temas: {
    campos: ['modulo_id', 'titulo', 'descripcion', 'orden'],
    orden: 'orden',
    escritura: ['admin', 'profesor'],
  },
  items: {
    campos: ['tema_id', 'titulo', 'tipo', 'url', 'contenido', 'duracion_min', 'orden'],
    orden: 'orden',
    escritura: ['admin', 'profesor'],
  },
  curso_profesores: {
    campos: ['curso_id', 'profesor_id'],
    orden: 'id',
    escritura: ['admin'],
  },
  inscripciones: {
    campos: ['curso_id', 'alumno_id', 'progreso'],
    orden: 'creado_en',
    escritura: ['admin'],
  },
};

export function esTablaValida(tabla: string): tabla is Tabla {
  return Object.prototype.hasOwnProperty.call(RECURSOS, tabla);
}

/** Deja pasar unicamente los campos declarados para la tabla. */
export function sanear(tabla: Tabla, cuerpo: Record<string, unknown>): Record<string, unknown> {
  const permitidos: readonly string[] = RECURSOS[tabla].campos;
  const limpio: Record<string, unknown> = {};
  Object.entries(cuerpo).forEach(([clave, valor]) => {
    if (permitidos.includes(clave) && valor !== undefined) limpio[clave] = valor === '' ? null : valor;
  });
  return limpio;
}
