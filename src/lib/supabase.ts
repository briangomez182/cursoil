import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url: string = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceKey: string = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const anonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabaseConfigurado: boolean = Boolean(url && (serviceKey || anonKey));

let cliente: SupabaseClient | null = null;

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
    });
  }
  return cliente;
}
