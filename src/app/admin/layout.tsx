import { redirect } from 'next/navigation';
import { getSesion } from '@/lib/session';

export default function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const sesion = getSesion();
  if (!sesion) redirect('/login');
  if (sesion.rol !== 'admin') redirect('/profesor');
  return <>{children}</>;
}
