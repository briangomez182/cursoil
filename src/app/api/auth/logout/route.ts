import { NextResponse } from 'next/server';
import { borrarCookieSesion } from '@/lib/session';

export async function POST() {
  borrarCookieSesion();
  return NextResponse.json({ ok: true });
}
