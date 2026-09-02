import 'server-only';
import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { SesionUsuario } from './types';

const COOKIE = 'petrolearn_sesion';
const SECRET: string = process.env.AUTH_SECRET ?? 'petrolearn-dev-secret';
const MAX_AGE = 60 * 60 * 24 * 7;

function firmar(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('base64url');
}

export function serializarSesion(sesion: SesionUsuario): string {
  const payload: string = Buffer.from(JSON.stringify(sesion), 'utf8').toString('base64url');
  return `${payload}.${firmar(payload)}`;
}

export function leerToken(token: string | undefined): SesionUsuario | null {
  if (!token) return null;
  const [payload, firma] = token.split('.');
  if (!payload || !firma) return null;
  const esperada: Buffer = Buffer.from(firmar(payload));
  const recibida: Buffer = Buffer.from(firma);
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return null;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SesionUsuario;
  } catch {
    return null;
  }
}

export function getSesion(): SesionUsuario | null {
  return leerToken(cookies().get(COOKIE)?.value);
}

export function crearCookieSesion(sesion: SesionUsuario): void {
  cookies().set(COOKIE, serializarSesion(sesion), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export function borrarCookieSesion(): void {
  cookies().delete(COOKIE);
}
