export type Rol = 'admin' | 'profesor' | 'alumno';
export type Nivel = 'Basico' | 'Intermedio' | 'Avanzado';
export type TipoItem = 'presentacion' | 'documento' | 'video';

export interface Usuario {
  id: string;
  usuario: string;
  email: string | null;
  nombre: string;
  rol: Rol;
  especialidad: string | null;
  bio: string | null;
  avatar_url: string | null;
  telefono: string | null;
  activo: boolean;
  creado_en: string;
}

export interface Curso {
  id: string;
  titulo: string;
  slug: string;
  descripcion: string | null;
  categoria: string;
  nivel: Nivel;
  duracion_horas: number;
  portada_url: string | null;
  publicado: boolean;
  creado_en: string;
}

export interface Modulo {
  id: string;
  curso_id: string;
  titulo: string;
  descripcion: string | null;
  orden: number;
  creado_en: string;
}

export interface Tema {
  id: string;
  modulo_id: string;
  titulo: string;
  descripcion: string | null;
  orden: number;
  creado_en: string;
}

export interface Item {
  id: string;
  tema_id: string;
  titulo: string;
  tipo: TipoItem;
  url: string | null;
  contenido: string | null;
  duracion_min: number;
  orden: number;
  creado_en: string;
}

export interface CursoProfesor {
  id: string;
  curso_id: string;
  profesor_id: string;
}

export interface SesionUsuario {
  id: string;
  usuario: string;
  nombre: string;
  rol: Rol;
}

export const NIVELES: readonly Nivel[] = ['Basico', 'Intermedio', 'Avanzado'] as const;

export const CATEGORIAS: readonly string[] = [
  'Upstream',
  'Midstream',
  'Downstream',
  'Seguridad Industrial',
  'Refinacion',
  'Gerencia y Normativa',
] as const;

export const TIPOS_ITEM: readonly { valor: TipoItem; etiqueta: string }[] = [
  { valor: 'presentacion', etiqueta: 'Presentacion (Google Slides)' },
  { valor: 'documento', etiqueta: 'Documento de texto (Markdown/HTML)' },
  { valor: 'video', etiqueta: 'Video (YouTube / Vimeo)' },
] as const;
