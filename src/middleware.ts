import { NextResponse, type NextRequest } from 'next/server';
import { consumir, type Regla } from '@/lib/rate-limit';

const MINUTO = 60_000;

/**
 * Limites por prefijo de ruta (gana la primera coincidencia, asi que van de
 * mas especifico a mas general). Cada prefijo lleva su propio contador por IP.
 */
const REGLAS: readonly { prefijo: string; regla: Regla }[] = [
  // Login / registro / logout: ventana corta para frenar fuerza bruta.
  { prefijo: '/api/auth/', regla: { limite: 20, ventanaMs: 5 * MINUTO } },
  // Subida de imagenes: operacion cara, poca frecuencia legitima.
  { prefijo: '/api/uploads', regla: { limite: 30, ventanaMs: 10 * MINUTO } },
  // Entrega de examenes.
  { prefijo: '/api/examen', regla: { limite: 40, ventanaMs: 10 * MINUTO } },
  // Resto de la API (incluye el panel /api/recursos, que hace rafagas al cargar).
  { prefijo: '/api/', regla: { limite: 120, ventanaMs: MINUTO } },
];

const DESACTIVADO: boolean = process.env.RATE_LIMIT_DESACTIVADO === '1';

function ipDe(request: NextRequest): string {
  const reenviada = request.headers.get('x-forwarded-for');
  if (reenviada) return reenviada.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? request.ip ?? 'desconocida';
}

export function middleware(request: NextRequest): NextResponse {
  if (DESACTIVADO) return NextResponse.next();

  const { pathname } = request.nextUrl;
  const entrada = REGLAS.find((r) => pathname.startsWith(r.prefijo));
  if (!entrada) return NextResponse.next();

  const clave = `${ipDe(request)}:${entrada.prefijo}`;
  const resultado = consumir(clave, entrada.regla);

  const cabeceras = new Headers({
    'X-RateLimit-Limit': String(resultado.limite),
    'X-RateLimit-Remaining': String(resultado.restantes),
    'X-RateLimit-Reset': String(Math.ceil(resultado.reinicia / 1000)),
  });

  if (!resultado.ok) {
    cabeceras.set('Retry-After', String(resultado.retryAfter));
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Espera unos minutos e intenta de nuevo.' },
      { status: 429, headers: cabeceras },
    );
  }

  const respuesta = NextResponse.next();
  cabeceras.forEach((valor, nombre) => respuesta.headers.set(nombre, valor));
  return respuesta;
}

export const config = {
  matcher: ['/api/:path*'],
};
