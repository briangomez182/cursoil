'use client';

import { motion } from 'framer-motion';

/** Ilustracion interactiva de balancin de petroleo para la pagina 404. */
export default function PozoAnimado() {
  return (
    <motion.svg
      viewBox="0 0 240 140"
      className="mx-auto h-40 w-full max-w-sm text-petro-500"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      role="img"
      aria-label="Balancin de petroleo animado"
    >
      <path d="M20 120h200" className="text-night" stroke="#0F172A" />
      <path d="M96 120 118 62l22 58" />
      <path d="M104 96h28" />

      <motion.g
        style={{ originX: '118px', originY: '62px' }}
        animate={{ rotate: [8, -8, 8] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path d="M62 62h112" strokeWidth={6} stroke="#0F172A" />
        <path d="M62 62a14 14 0 0 1 0 24" stroke="#3B82F6" />
        <path d="M174 62v18" stroke="#3B82F6" />
        <circle cx="174" cy="86" r="6" fill="#DCE6F8" />
      </motion.g>

      <motion.circle
        cx="62"
        cy="112"
        r="5"
        fill="#3B82F6"
        stroke="none"
        animate={{ cy: [112, 104, 112], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
}
