'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function FormularioLogin() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);

  async function enviar(evento: React.FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault();
    setCargando(true);
    setError('');

    const respuesta = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password }),
    });
    const datos = (await respuesta.json()) as { ok?: boolean; rol?: string; error?: string };
    setCargando(false);

    if (!respuesta.ok) {
      setError(datos.error ?? 'No se pudo iniciar sesion.');
      return;
    }

    const destino: string = datos.rol === 'admin' ? '/admin' : datos.rol === 'profesor' ? '/profesor' : '/';
    router.push(destino);
    router.refresh();
  }

  return (
    <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} onSubmit={enviar} className="space-y-4">
      <div>
        <label className="etiqueta" htmlFor="usuario">Usuario o correo</label>
        <input id="usuario" className="campo" value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="admin" autoComplete="username" required />
      </div>
      <div>
        <label className="etiqueta" htmlFor="password">Contrasena</label>
        <input id="password" type="password" className="campo" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" autoComplete="current-password" required />
      </div>

      {error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}

      <button type="submit" className="cta w-full" disabled={cargando}>
        {cargando ? 'Verificando...' : 'Entrar'}
      </button>

      <p className="rounded-2xl bg-petro-50 px-4 py-3 text-xs font-medium text-slate-500">
        Acceso por defecto del administrador: <strong className="text-night">admin</strong> / <strong className="text-night">admin</strong>
      </p>
    </motion.form>
  );
}
