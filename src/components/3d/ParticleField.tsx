import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
  color?: string;
  audioData?: Uint8Array;
}

export function ParticleField({ count = 2000, color = '#9333ea', audioData }: ParticleFieldProps) {
  const meshRef = useRef<THREE.Points>(null);
  const originalPositions = useRef<Float32Array | null>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const baseColor = new THREE.Color(color);
    const accentColor = new THREE.Color('#f59e0b');
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Spherical distribution
      const radius = 15 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Color gradient
      const t = Math.random();
      const mixedColor = baseColor.clone().lerp(accentColor, t * 0.3);
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }
    
    originalPositions.current = positions.slice();
    
    return { positions, colors };
  }, [count, color]);

  useFrame((state) => {
    if (!meshRef.current || !originalPositions.current) return;

    const time = state.clock.elapsedTime;
    const positionAttribute = meshRef.current.geometry.attributes.position;
    const posArray = positionAttribute.array as Float32Array;
    
    // Get audio intensity
    let audioIntensity = 0;
    if (audioData && audioData.length > 0) {
      audioIntensity = audioData.reduce((a, b) => a + b, 0) / audioData.length / 255;
    }

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const origX = originalPositions.current[i3];
      const origY = originalPositions.current[i3 + 1];
      const origZ = originalPositions.current[i3 + 2];
      
      // Wave motion
      const wave = Math.sin(time * 0.5 + origX * 0.1) * 0.5;
      const wave2 = Math.cos(time * 0.3 + origY * 0.1) * 0.5;
      
      // Audio reactivity
      const audioOffset = audioIntensity * 3;
      
      posArray[i3] = origX + wave + audioOffset * Math.sin(i);
      posArray[i3 + 1] = origY + wave2 + audioOffset * Math.cos(i);
      posArray[i3 + 2] = origZ + Math.sin(time * 0.2 + i * 0.01) * 0.5;
    }
    
    positionAttribute.needsUpdate = true;
    
    // Rotate the entire field
    meshRef.current.rotation.y = time * 0.05;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
