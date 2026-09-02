import Link from 'next/link';
import PozoAnimado from '@/components/PozoAnimado';

export default function NoEncontrado() {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <main className="w-full max-w-3xl overflow-hidden rounded-[2.5rem] bg-white p-10 text-center shadow-soft sm:p-16">
        <PozoAnimado />
        <p className="chip mt-8">Error 404</p>
        <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-night sm:text-6xl">Pozo seco</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-500">
          Perforamos hasta el fondo y no encontramos la pagina que buscas. Puede que haya sido movida o que el enlace
          este mal escrito.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="cta">Volver al inicio</Link>
          <Link href="/#cursos" className="cta-suave">Ver los cursos</Link>
        </div>
      </main>
    </div>
  );
}
