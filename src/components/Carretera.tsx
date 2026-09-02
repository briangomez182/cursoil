'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

const LARGO_SEGMENTO = 1.4;
const CANTIDAD = 14;
const LARGO_TOTAL = LARGO_SEGMENTO * CANTIDAD;

/** Linea de carretera simplificada con desplazamiento continuo. */
export default function Carretera() {
  const grupo = useRef<Group>(null);
  const segmentos: number[] = useMemo(
    () => Array.from({ length: CANTIDAD }, (_, i) => i * LARGO_SEGMENTO - LARGO_TOTAL / 2),
    [],
  );

  useFrame((_, delta) => {
    if (!grupo.current) return;
    grupo.current.children.forEach((hijo) => {
      hijo.position.x -= delta * 3.2;
      if (hijo.position.x < -LARGO_TOTAL / 2) hijo.position.x += LARGO_TOTAL;
    });
  });

  return (
    <group position={[0, -0.36, 0]}>
      {/* Asfalto */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[LARGO_TOTAL, 3.2]} />
        <meshStandardMaterial color="#DCE6F8" roughness={0.9} />
      </mesh>
      {/* Lineas discontinuas en movimiento */}
      <group ref={grupo}>
        {segmentos.map((x) => (
          <mesh key={x} position={[x, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.7, 0.09]} />
            <meshBasicMaterial color="#3B82F6" />
          </mesh>
        ))}
      </group>
    </group>
  );
}
