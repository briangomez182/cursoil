'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';

const AZUL_METALICO = '#7BA2E6';
const AZUL_PROFUNDO = '#1D4ED8';
const AZUL_CLARO = '#DCE6F8';
const NOCHE = '#0F172A';

interface RuedaProps {
  posicion: [number, number, number];
}

function Rueda({ posicion }: RuedaProps) {
  const rueda = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (rueda.current) rueda.current.rotation.z -= delta * 6;
  });

  return (
    <mesh ref={rueda} position={posicion} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.42, 0.42, 0.24, 24]} />
      <meshStandardMaterial color={NOCHE} metalness={0.3} roughness={0.6} />
    </mesh>
  );
}

/** Camion cisterna estilizado construido con primitivas, en tonos azulados metalicos. */
export default function CamionCisterna() {
  const grupo = useRef<Group>(null);

  useFrame((estado) => {
    if (!grupo.current) return;
    const { x, y } = estado.pointer;
    const tiempo: number = estado.clock.getElapsedTime();
    // Rotacion leve siguiendo el cursor + flotacion continua
    grupo.current.rotation.y += (x * 0.45 - 0.25 - grupo.current.rotation.y) * 0.05;
    grupo.current.rotation.x += (-y * 0.12 - grupo.current.rotation.x) * 0.05;
    grupo.current.position.y = Math.sin(tiempo * 1.4) * 0.06 - 0.1;
  });

  return (
    <group ref={grupo} scale={1.05}>
      {/* Tanque cisterna */}
      <mesh position={[0.55, 0.75, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.62, 2.1, 8, 24]} />
        <meshStandardMaterial color={AZUL_METALICO} metalness={0.75} roughness={0.25} />
      </mesh>

      {/* Aros del tanque */}
      {[-0.35, 0.55, 1.45].map((x) => (
        <mesh key={x} position={[x, 0.75, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.63, 0.035, 12, 32]} />
          <meshStandardMaterial color={AZUL_PROFUNDO} metalness={0.6} roughness={0.35} />
        </mesh>
      ))}

      {/* Boca de carga */}
      <mesh position={[0.55, 1.42, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.18, 16]} />
        <meshStandardMaterial color={AZUL_PROFUNDO} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Chasis */}
      <mesh position={[0.2, 0.2, 0]}>
        <boxGeometry args={[3.6, 0.16, 0.95]} />
        <meshStandardMaterial color={NOCHE} metalness={0.4} roughness={0.55} />
      </mesh>

      {/* Cabina */}
      <mesh position={[-1.75, 0.72, 0]} castShadow>
        <boxGeometry args={[1.05, 0.9, 1.05]} />
        <meshStandardMaterial color={AZUL_PROFUNDO} metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[-1.75, 1.24, 0]}>
        <boxGeometry args={[0.95, 0.16, 0.98]} />
        <meshStandardMaterial color={AZUL_CLARO} metalness={0.2} roughness={0.5} />
      </mesh>
      {/* Parabrisas */}
      <mesh position={[-2.29, 0.86, 0]}>
        <boxGeometry args={[0.04, 0.42, 0.86]} />
        <meshStandardMaterial color={AZUL_CLARO} metalness={0.1} roughness={0.15} />
      </mesh>
      {/* Faro */}
      <mesh position={[-2.29, 0.42, 0.32]}>
        <boxGeometry args={[0.06, 0.14, 0.2]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#DCE6F8" emissiveIntensity={0.6} />
      </mesh>

      {/* Gota de petroleo como emblema */}
      <mesh position={[0.55, 0.78, 0.63]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.16, 0.34, 16]} />
        <meshStandardMaterial color={AZUL_PROFUNDO} metalness={0.4} roughness={0.3} />
      </mesh>

      {/* Ruedas */}
      {([[-1.7, 0.05, 0.55], [-1.7, 0.05, -0.55], [0.55, 0.05, 0.55], [0.55, 0.05, -0.55], [1.35, 0.05, 0.55], [1.35, 0.05, -0.55]] as [number, number, number][]).map(
        (p, i) => (
          <Rueda key={i} posicion={p} />
        ),
      )}
    </group>
  );
}
