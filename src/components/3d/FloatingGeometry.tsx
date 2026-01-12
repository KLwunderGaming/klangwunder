import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FloatingGeometryProps {
  audioData?: Uint8Array;
}

export function FloatingGeometry({ audioData }: FloatingGeometryProps) {
  const group1Ref = useRef<THREE.Mesh>(null);
  const group2Ref = useRef<THREE.Mesh>(null);
  const group3Ref = useRef<THREE.Mesh>(null);
  const torusRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Audio intensity
    let intensity = 0;
    if (audioData && audioData.length > 0) {
      intensity = audioData.reduce((a, b) => a + b, 0) / audioData.length / 255;
    }
    
    const scale = 1 + intensity * 0.5;

    if (group1Ref.current) {
      group1Ref.current.rotation.x = time * 0.2;
      group1Ref.current.rotation.y = time * 0.3;
      group1Ref.current.position.y = Math.sin(time * 0.5) * 2 + 3;
      group1Ref.current.scale.setScalar(scale);
    }

    if (group2Ref.current) {
      group2Ref.current.rotation.x = time * 0.3;
      group2Ref.current.rotation.z = time * 0.2;
      group2Ref.current.position.y = Math.cos(time * 0.4) * 2 - 3;
      group2Ref.current.scale.setScalar(scale);
    }

    if (group3Ref.current) {
      group3Ref.current.rotation.y = time * 0.4;
      group3Ref.current.rotation.z = time * 0.1;
      group3Ref.current.position.x = Math.sin(time * 0.3) * 3;
      group3Ref.current.scale.setScalar(scale);
    }

    if (torusRef.current) {
      torusRef.current.rotation.x = time * 0.2;
      torusRef.current.rotation.y = time * 0.1;
      torusRef.current.scale.setScalar(1 + intensity * 0.3);
    }
  });

  return (
    <>
      {/* Octahedron */}
      <mesh ref={group1Ref} position={[-8, 3, -5]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#9333ea"
          metalness={0.9}
          roughness={0.1}
          emissive="#7c3aed"
          emissiveIntensity={0.2}
          wireframe
        />
      </mesh>

      {/* Icosahedron */}
      <mesh ref={group2Ref} position={[8, -3, -8]}>
        <icosahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial
          color="#c084fc"
          metalness={0.8}
          roughness={0.2}
          emissive="#a855f7"
          emissiveIntensity={0.3}
          wireframe
        />
      </mesh>

      {/* Dodecahedron */}
      <mesh ref={group3Ref} position={[0, 5, -10]}>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color="#f59e0b"
          metalness={0.7}
          roughness={0.3}
          emissive="#d97706"
          emissiveIntensity={0.2}
          wireframe
        />
      </mesh>

      {/* Large background torus */}
      <mesh ref={torusRef} position={[0, 0, -15]}>
        <torusGeometry args={[6, 0.3, 16, 100]} />
        <meshStandardMaterial
          color="#9333ea"
          metalness={0.9}
          roughness={0.1}
          emissive="#7c3aed"
          emissiveIntensity={0.1}
          transparent
          opacity={0.4}
        />
      </mesh>
    </>
  );
}
