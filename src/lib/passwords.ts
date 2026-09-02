import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEYLEN = 64;

export function hashPassword(plano: string): string {
  const salt: string = randomBytes(16).toString('hex');
  const derivada: string = scryptSync(plano, salt, KEYLEN).toString('hex');
  return `scrypt$${salt}$${derivada}`;
}

export function verifyPassword(plano: string, almacenada: string): boolean {
  const partes: string[] = almacenada.split('$');
  if (partes.length !== 3 || partes[0] !== 'scrypt') return false;
  const [, salt, esperada] = partes;
  const derivada: Buffer = scryptSync(plano, salt, KEYLEN);
  const esperadaBuf: Buffer = Buffer.from(esperada, 'hex');
  if (esperadaBuf.length !== derivada.length) return false;
  return timingSafeEqual(derivada, esperadaBuf);
}
