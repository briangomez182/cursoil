import Link from 'next/link';
import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import Logo from '@/components/Logo';
import Aparecer from '@/components/Aparecer';
import { PLATAFORMA } from '@/lib/config';

export const metadata: Metadata = { title: 'Terminos y condiciones | PetroLearn' };

const SECCIONES: readonly { titulo: string; parrafos: string[] }[] = [
  {
    titulo: '1. Objeto del servicio',
    parrafos: [
      'PetroLearn es una plataforma de formacion tecnica en linea orientada a la industria de hidrocarburos. Ofrece cursos organizados en modulos, temas e items de contenido en formato de presentacion, documento o video.',
      'El acceso a la plataforma implica la aceptacion plena de estos terminos por parte del usuario.',
    ],
  },
  {
    titulo: '2. Cuentas y roles',
    parrafos: [
      'Existen tres roles: alumno, profesor y administrador. El alumno se registra libremente; los profesores y administradores son creados por la direccion academica.',
      'El usuario es responsable de la confidencialidad de sus credenciales y de toda actividad realizada con ellas.',
    ],
  },
  {
    titulo: '3. Contenido academico',
    parrafos: [
      'Los materiales publicados son propiedad de PetroLearn o de sus autores y se ceden unicamente para uso formativo personal.',
      'Queda prohibida la reproduccion, distribucion o comercializacion del contenido sin autorizacion escrita.',
    ],
  },
  {
    titulo: '4. Inscripciones y agendas',
    parrafos: [
      'Las cohortes cerradas y formaciones corporativas se agendan a traves del telefono de contacto de la plataforma.',
      'Las condiciones economicas de cada programa se acuerdan por escrito antes del inicio de la formacion.',
    ],
  },
  {
    titulo: '5. Uso aceptable',
    parrafos: [
      'El usuario se compromete a no vulnerar la seguridad de la plataforma, no suplantar identidades y no publicar contenido ilicito u ofensivo.',
      'PetroLearn puede suspender cuentas que incumplan estas condiciones.',
    ],
  },
  {
    titulo: '6. Datos personales',
    parrafos: [
      'Los datos recabados (nombre, correo, usuario) se utilizan exclusivamente para la gestion academica y el contacto con el estudiante.',
      'El usuario puede solicitar la rectificacion o eliminacion de sus datos escribiendo al contacto indicado al pie de esta pagina.',
    ],
  },
  {
    titulo: '7. Limitacion de responsabilidad',
    parrafos: [
      'La formacion tiene caracter educativo y no sustituye la normativa, los procedimientos internos ni las certificaciones oficiales exigidas por cada operadora.',
      'PetroLearn no se responsabiliza por decisiones operativas tomadas a partir del contenido de los cursos.',
    ],
  },
  {
    titulo: '8. Legislacion aplicable',
    parrafos: [
      'Estos terminos se rigen por las leyes de la Republica Bolivariana de Venezuela. Cualquier controversia se dirimira ante los tribunales competentes del estado Anzoategui.',
    ],
  },
];

export default function PaginaTerminos() {
  return (
    <div className="px-3 pb-3 pt-3 sm:px-6 sm:pt-6">
      <div className="mx-auto max-w-[1100px] overflow-hidden rounded-[2.5rem] bg-white shadow-soft">
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-12">
          <Logo />
          <Link href="/" className="text-sm font-semibold text-slate-500 transition hover:text-night">
            Volver al inicio
          </Link>
        </header>

        <main className="px-6 py-14 sm:px-12">
          <Aparecer>
            <p className="chip">Documento legal</p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-night">Terminos y condiciones</h1>
            <p className="mt-3 text-sm text-slate-500">
              Ultima actualizacion: enero de 2026 - {PLATAFORMA.ciudad}, {PLATAFORMA.estado}, {PLATAFORMA.pais}.
            </p>
          </Aparecer>

          <div className="mt-10 space-y-10">
            {SECCIONES.map((seccion, i) => (
              <Aparecer key={seccion.titulo} retraso={i * 0.04}>
                <section aria-labelledby={`sec-${i}`}>
                  <h2 id={`sec-${i}`} className="text-lg font-bold text-night">{seccion.titulo}</h2>
                  {seccion.parrafos.map((p) => (
                    <p key={p} className="mt-3 text-sm leading-relaxed text-slate-500">{p}</p>
                  ))}
                </section>
              </Aparecer>
            ))}
          </div>

          <aside className="mt-12 rounded-[2rem] bg-petro-50 p-8">
            <h2 className="text-base font-bold text-night">Contacto legal y academico</h2>
            <address className="mt-3 text-sm not-italic leading-relaxed text-slate-600">
              {PLATAFORMA.ciudad}, {PLATAFORMA.estado} - {PLATAFORMA.pais}
              <br />
              Telefono: <a href={`tel:${PLATAFORMA.telefono}`} className="font-semibold text-petro-600">{PLATAFORMA.telefonoLegible}</a>
            </address>
          </aside>
        </main>

        <Footer />
      </div>
    </div>
  );
}
