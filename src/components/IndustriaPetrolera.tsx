'use client';

import { motion } from 'framer-motion';

/** Ilustracion plana de un complejo petrolero: balancin, tanques, refineria, torre y camion cisterna. */
export default function IndustriaPetrolera() {
  return (
    <svg
      viewBox="0 0 1600 360"
      className="h-auto w-full text-petro-500"
      fill="none"
      stroke="currentColor"
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Ilustracion de un complejo industrial petrolero"
    >
      {/* nubes decorativas */}
      <g className="text-petro-200" stroke="currentColor" strokeWidth={4} strokeDasharray="2 10">
        <path d="M120 60h90M90 76h140" />
        <path d="M1000 40h80M975 56h120" />
        <path d="M1430 100h70M1405 116h110" />
      </g>

      {/* linea de suelo */}
      <path d="M40 304h1520" stroke="#0F172A" strokeWidth={5} />

      {/* --- balancin (pumpjack) --- */}
      <g transform="translate(80,0)">
        <path d="M20 304 76 172l56 132" />
        <path d="M40 244h72" />
        <motion.g
          style={{ originX: '76px', originY: '172px' }}
          animate={{ rotate: [7, -7, 7] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M8 172h176" strokeWidth={8} stroke="#0F172A" />
          <path d="M8 172a18 18 0 0 0 0 30" />
          <rect x="-2" y="160" width="26" height="24" rx="4" fill="#0F172A" stroke="none" />
          <path d="M184 172v22" />
          <circle cx="184" cy="200" r="7" fill="#DCE6F8" />
        </motion.g>
        <motion.circle
          cx="76"
          cy="300"
          r="6"
          fill="#3B82F6"
          stroke="none"
          animate={{ cy: [300, 290, 300], opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <rect x="52" y="290" width="48" height="16" rx="4" fill="#F5F8FF" />
        <path d="M52 306v-16h48v16" />
      </g>

      {/* --- tanque horizontal --- */}
      <g transform="translate(300,0)">
        <rect x="0" y="240" width="140" height="52" rx="26" fill="#F5F8FF" />
        <path d="M20 292v12M120 292v12M4 304v-12M136 304v-12" />
        <path d="M35 240v52M105 240v52" stroke="#C7D7F5" strokeWidth={3} />
      </g>

      {/* --- tanque esferico pequeno --- */}
      <g transform="translate(470,0)">
        <circle cx="40" cy="252" r="34" fill="#F5F8FF" />
        <path d="M14 288v10M66 288v10M40 288v10" />
      </g>

      {/* --- tanque grande de almacenamiento con gota --- */}
      <g transform="translate(560,0)">
        <rect x="0" y="150" width="150" height="140" rx="10" fill="#F5F8FF" />
        <ellipse cx="75" cy="150" rx="75" ry="16" fill="#DCE6F8" />
        <path d="M0 178h150M0 262h150" stroke="#C7D7F5" strokeWidth={3} />
        <path
          d="M75 190c14 17 22 29 22 39a22 22 0 1 1-44 0c0-10 8-22 22-39Z"
          fill="#3B82F6"
          stroke="none"
        />
      </g>

      {/* --- flare stack con llama --- */}
      <g transform="translate(770,0)">
        <path d="M20 304V70" strokeWidth={6} stroke="#0F172A" />
        <path d="M0 100h40M0 140h40M0 180h40" strokeWidth={3} stroke="#C7D7F5" />
        <motion.path
          d="M20 70c14 16 20 27 20 36a20 20 0 1 1-40 0c0-9 6-20 20-36Z"
          fill="#3B82F6"
          stroke="none"
          animate={{ scaleY: [1, 1.14, 0.94, 1], opacity: [0.85, 1, 0.85, 0.85] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '20px', originY: '122px' }}
        />
      </g>

      {/* --- torres de refineria --- */}
      <g transform="translate(870,0)">
        <rect x="0" y="150" width="34" height="154" rx="6" fill="#F5F8FF" />
        <path d="M0 190h34M0 230h34M0 270h34" strokeWidth={3} stroke="#C7D7F5" />
        <path d="M17 150v-30M4 120h26" />

        <rect x="70" y="90" width="40" height="214" rx="6" fill="#F5F8FF" />
        <path d="M70 130h40M70 170h40M70 210h40M70 250h40" strokeWidth={3} stroke="#C7D7F5" />
        <path d="M90 90v-26" />

        <rect x="150" y="120" width="34" height="184" rx="6" fill="#F5F8FF" />
        <path d="M150 156h34M150 192h34M150 228h34M150 264h34" strokeWidth={3} stroke="#C7D7F5" />
        <path d="M167 120v-24" />

        <path d="M40 210h30M40 250h30M120 170h30M120 230h30" stroke="#A9C2EF" strokeWidth={3} />
      </g>

      {/* --- edificio pequeno con gota --- */}
      <g transform="translate(1120,0)">
        <path d="M0 304V220l55-30 55 30v84Z" fill="#F5F8FF" />
        <rect x="26" y="256" width="58" height="48" fill="#DCE6F8" />
        <path
          d="M55 232c9 10 13 18 13 24a13 13 0 1 1-26 0c0-6 4-14 13-24Z"
          fill="#3B82F6"
          stroke="none"
        />
      </g>

      {/* --- torre de perforacion (derrick) --- */}
      <g transform="translate(1270,0)">
        <path d="M10 304 40 60h20l30 244Z" stroke="#0F172A" strokeWidth={4} />
        <path
          d="M14 304 78 258M86 304 22 258M22 258 71 212M78 258 29 212M29 212 64 166M71 212 36 166M36 166 57 120M64 166 43 120"
          stroke="#0F172A"
          strokeWidth={2.5}
        />
        <rect x="30" y="52" width="40" height="14" rx="3" fill="#0F172A" stroke="none" />
        <path d="M50 52V32" stroke="#0F172A" strokeWidth={3} />
      </g>

      {/* --- camion cisterna --- */}
      <g transform="translate(1400,0)">
        <path d="M0 304v-46h190v46" fill="#F5F8FF" />
        <rect x="4" y="240" width="182" height="18" rx="6" fill="#DCE6F8" />
        <path d="M-70 304v-60h50l24 24h16v36Z" fill="#0F172A" stroke="none" />
        <rect x="-56" y="256" width="26" height="20" rx="3" fill="#BFD3F7" stroke="none" />
        <path
          d="M95 262c8 9 12 16 12 21a12 12 0 1 1-24 0c0-5 4-12 12-21Z"
          fill="#3B82F6"
          stroke="none"
        />
        <circle cx="-40" cy="304" r="16" fill="#0F172A" stroke="none" />
        <circle cx="-40" cy="304" r="6" fill="#F5F8FF" stroke="none" />
        <circle cx="40" cy="304" r="16" fill="#0F172A" stroke="none" />
        <circle cx="40" cy="304" r="6" fill="#F5F8FF" stroke="none" />
        <circle cx="140" cy="304" r="16" fill="#0F172A" stroke="none" />
        <circle cx="140" cy="304" r="6" fill="#F5F8FF" stroke="none" />
      </g>
    </svg>
  );
}
