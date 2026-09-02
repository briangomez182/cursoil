import Link from 'next/link';

export default function Logo({ compacto = false }: { compacto?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Cursoil, ir al inicio">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-night">
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
          <path d="M12 3.2c3.1 3.6 5.3 6.5 5.3 9.1A5.3 5.3 0 0 1 12 17.6a5.3 5.3 0 0 1-5.3-5.3c0-2.6 2.2-5.5 5.3-9.1Z" fill="#3B82F6" />
          <path d="M12 7.4c1.6 2 2.6 3.5 2.6 4.8A2.6 2.6 0 0 1 12 14.8Z" fill="#DCE6F8" />
        </svg>
      </span>
      {!compacto && (
        <span className="leading-tight">
          <span className="block text-lg font-extrabold tracking-tight text-night">Cursoil</span>
          <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-petro-500">
            Industria Petrolera
          </span>
        </span>
      )}
    </Link>
  );
}
