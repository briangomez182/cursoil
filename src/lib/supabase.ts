import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url: string = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceKey: string = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const anonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabaseConfigurado: boolean = Boolean(url && (serviceKey || anonKey));
/** Supabase Auth (registro con confirmacion de correo) necesita la anon key. */
export const supabaseAuthConfigurado: boolean = Boolean(url && anonKey);

let cliente: SupabaseClient | null = null;
let clienteAuth: SupabaseClient | null = null;

/** Cliente de servidor: usa la service role key (bypass RLS). Solo en Server Components / Route Handlers. */
export function getSupabase(): SupabaseClient {
  if (!supabaseConfigurado) {
    throw new Error(
      'Supabase no esta configurado. Copia .env.local.example a .env.local y completa NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.',
    );
  }
  if (!cliente) {
    cliente = createClient(url, serviceKey || anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      // Next.js parchea `fetch` con su capa de cache: sin esto, las consultas
      // con `.order(...)` pueden devolver 0 filas (respuesta cacheada/vacia).
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
          fetch(input, { ...init, cache: 'no-store' }),
      },
    });
  }
  return cliente;
}

/**
 * Cliente para operaciones de Supabase Auth de los alumnos: `signUp` dispara el
 * correo de confirmacion y `signInWithPassword` valida credenciales + correo verificado.
 * Usa la anon key (no la service role) para respetar el flujo publico de Auth.
 */
export function getSupabaseAuth(): SupabaseClient {
  if (!supabaseAuthConfigurado) {
    throw new Error(
      'Supabase Auth no esta configurado. Agrega NEXT_PUBLIC_SUPABASE_ANON_KEY a .env.local.',
    );
  }
  if (!clienteAuth) {
    clienteAuth = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return clienteAuth;
}
