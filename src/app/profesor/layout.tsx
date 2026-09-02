import { redirect } from 'next/navigation';
import { getSesion } from '@/lib/session';

export default function LayoutProfesor({ children }: { children: React.ReactNode }) {
  const sesion = getSesion();
  if (!sesion) redirect('/login');
  if (sesion.rol === 'alumno') redirect('/');
  return <>{children}</>;
}
