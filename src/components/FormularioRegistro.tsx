'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function FormularioRegistro() {
  const router = useRouter();
  const [nombre, setNombre] = useState<string>('');
  const [usuario, setUsuario] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [acepta, setAcepta] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);

  async function enviar(evento: React.FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault();
    setCargando(true);
    setError('');

    const respuesta = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, usuario, email, password }),
    });
    const datos = (await respuesta.json()) as { error?: string };
    setCargando(false);

    if (!respuesta.ok) {
      setError(datos.error ?? 'No se pudo completar el registro.');
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} onSubmit={enviar} className="space-y-4">
      <div>
        <label className="etiqueta" htmlFor="nombre">Nombre y apellido</label>
        <input id="nombre" className="campo" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Maria Perez" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="etiqueta" htmlFor="usuario-reg">Usuario</label>
          <input id="usuario-reg" className="campo" value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="mperez" required />
        </div>
        <div>
          <label className="etiqueta" htmlFor="email">Correo</label>
          <input id="email" type="email" className="campo" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="maria@correo.com" required />
        </div>
      </div>
      <div>
        <label className="etiqueta" htmlFor="password-reg">Contrasena</label>
        <input id="password-reg" type="password" className="campo" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimo 6 caracteres" minLength={6} required />
      </div>

      <label className="flex items-start gap-3 text-sm text-slate-500">
        <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-petro-600" required />
        <span>
          Acepto los <Link href="/terminos" className="font-semibold text-petro-600 underline">terminos y condiciones</Link> de la plataforma.
        </span>
      </label>

      {error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}

      <button type="submit" className="cta w-full" disabled={cargando || !acepta}>
        {cargando ? 'Creando cuenta...' : 'Crear mi cuenta'}
      </button>
    </motion.form>
  );
}
