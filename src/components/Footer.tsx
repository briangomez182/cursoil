import Link from 'next/link';
import Logo from './Logo';
import { PLATAFORMA } from '@/lib/config';

export default function Footer() {
  const anio: number = new Date().getFullYear();

  return (
    <footer className="mt-16 rounded-t-[2.5rem] bg-night px-6 py-14 text-slate-300 sm:px-12">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <section>
          <div className="rounded-3xl bg-white/95 p-4">
            <Logo />
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-400">
            Formacion tecnica especializada para profesionales del sector energetico venezolano.
          </p>
        </section>

        <nav aria-label="Cursos">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Cursos</h2>
          <ul className="space-y-2.5 text-sm">
            <li><a href="/#cursos" className="transition hover:text-petro-400">Upstream</a></li>
            <li><a href="/#cursos" className="transition hover:text-petro-400">Midstream</a></li>
            <li><a href="/#cursos" className="transition hover:text-petro-400">Downstream</a></li>
            <li><a href="/#cursos" className="transition hover:text-petro-400">Seguridad Industrial</a></li>
          </ul>
        </nav>

        <nav aria-label="Plataforma">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Plataforma</h2>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/login" className="transition hover:text-petro-400">Iniciar sesion</Link></li>
            <li><Link href="/register" className="transition hover:text-petro-400">Registrarse</Link></li>
            <li><Link href="/terminos" className="transition hover:text-petro-400">Terminos y condiciones</Link></li>
            <li><a href="/#profesores" className="transition hover:text-petro-400">Nuestros profesores</a></li>
          </ul>
        </nav>

        <section>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Contacto y agendas</h2>
          <address className="space-y-2.5 text-sm not-italic leading-relaxed text-slate-400">
            <p>{PLATAFORMA.ciudad}, {PLATAFORMA.estado}<br />{PLATAFORMA.pais}</p>
            <p>
              <a href={`tel:${PLATAFORMA.telefono}`} className="font-semibold text-white transition hover:text-petro-400">
                {PLATAFORMA.telefonoLegible}
              </a>
            </p>
            <p>
              <a href={PLATAFORMA.whatsapp} className="chip bg-petro-500/20 text-petro-300" target="_blank" rel="noreferrer">
                Agendar por WhatsApp
              </a>
            </p>
          </address>
        </section>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {anio} PetroLearn. Todos los derechos reservados.</p>
        <p>Hecho en {PLATAFORMA.ciudad}, {PLATAFORMA.pais}.</p>
      </div>
    </footer>
  );
}
