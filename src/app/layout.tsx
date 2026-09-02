import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'PetroLearn | Cursos de la Industria Petrolera',
  description:
    'Plataforma de formacion industrial en petroleo y gas. Cursos de upstream, midstream, downstream, refinacion y seguridad industrial desde Puerto Piritu, Anzoategui, Venezuela.',
  keywords: ['cursos petroleros', 'formacion industrial', 'oil and gas', 'Venezuela', 'PetroLearn'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={jakarta.variable}>
      <body className="min-h-screen bg-canvasbg font-sans antialiased">{children}</body>
    </html>
  );
}
