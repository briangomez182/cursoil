'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const Escena3D = dynamic(() => import('./Escena3D'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <p className="animate-pulse text-sm font-medium text-petro-500">Cargando escena 3D...</p>
    </div>
  ),
});

/** Contenedor del canvas 3D con entrada animada. */
export default function Hero3D() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
      className="relative h-[300px] w-full overflow-hidden rounded-[2.5rem] bg-petro-50 sm:h-[380px] lg:h-[440px]"
    >
      <Escena3D />
      <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] font-medium uppercase tracking-[0.2em] text-petro-500">
        Mueve el cursor para girar el camion
      </p>
    </motion.div>
  );
}
