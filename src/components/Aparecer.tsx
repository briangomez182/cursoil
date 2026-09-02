'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  retraso?: number;
  className?: string;
}

/** Envoltorio de entrada animada reutilizable. */
export default function Aparecer({ children, retraso = 0, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: retraso }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
