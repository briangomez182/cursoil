'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, Float } from '@react-three/drei';
import CamionCisterna from './CamionCisterna';
import Carretera from './Carretera';

/** Canvas 3D del Hero: camion cisterna sobre carretera en movimiento. */
export default function Escena3D() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 1.6, 7.2], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      aria-label="Camion cisterna de petroleo en 3D"
    >
      <color attach="background" args={['#F5F8FF']} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 4]} intensity={1.5} castShadow />
      <directionalLight position={[-5, 3, -4]} intensity={0.5} color="#3B82F6" />

      <Suspense fallback={null}>
        <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.25}>
          <CamionCisterna />
        </Float>
        <Carretera />
        <ContactShadows position={[0, -0.35, 0]} opacity={0.35} scale={12} blur={2.6} far={4} color="#0F172A" />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}
