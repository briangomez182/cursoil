import 'server-only';
import { getSupabase, supabaseConfigurado } from './supabase';
import type { Curso, Item, Modulo, Tema, Usuario } from './types';
import { CURSOS_DEMO, PROFESORES_DEMO } from './demo';

/** Cursos publicados + sus profesores asignados. Cae a datos demo si Supabase no responde. */
export async function listarCursosPublicos(): Promise<Curso[]> {
  if (!supabaseConfigurado) return CURSOS_DEMO;
  try {
    const { data, error } = await getSupabase()
      .from('cursos')
      .select('*')
      .eq('publicado', true)
      .order('creado_en', { ascending: true });
    if (error || !data || data.length === 0) return CURSOS_DEMO;
    return data as Curso[];
  } catch {
    return CURSOS_DEMO;
  }
}

export async function listarProfesoresPublicos(): Promise<Usuario[]> {
  if (!supabaseConfigurado) return PROFESORES_DEMO;
  try {
    const { data, error } = await getSupabase()
      .from('usuarios')
      .select('id,usuario,email,nombre,rol,especialidad,bio,avatar_url,telefono,activo,creado_en')
      .eq('rol', 'profesor')
      .eq('activo', true);
    if (error || !data || data.length === 0) return PROFESORES_DEMO;
    return data as Usuario[];
  } catch {
    return PROFESORES_DEMO;
  }
}

export async function listarTabla<T>(tabla: string, orden: string = 'creado_en'): Promise<T[]> {
  if (!supabaseConfigurado) return [];
  try {
    const { data, error } = await getSupabase().from(tabla).select('*').order(orden, { ascending: true });
    if (error || !data) return [];
    return data as T[];
  } catch {
    return [];
  }
}

export async function listarModulos(): Promise<Modulo[]> {
  return listarTabla<Modulo>('modulos', 'orden');
}
export async function listarTemas(): Promise<Tema[]> {
  return listarTabla<Tema>('temas', 'orden');
}
export async function listarItems(): Promise<Item[]> {
  return listarTabla<Item>('items', 'orden');
}
