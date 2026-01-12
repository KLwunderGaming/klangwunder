import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center, Float } from '@react-three/drei';
import * as THREE from 'three';

interface AnimatedTextProps {
  text: string;
  position?: [number, number, number];
  onAnimationComplete?: () => void;
}

export function AnimatedText3D({ text, position = [0, 0, 0] }: AnimatedTextProps) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  const gradient = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#9333ea');
    gradient.addColorStop(0.5, '#c084fc');
    gradient.addColorStop(1, '#f59e0b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef} position={position}>
        <Center>
          <Text3D
            font="./fonts/helvetiker_bold.typeface.json"
            size={1.2}
            height={0.3}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
          >
            {text}
            <meshStandardMaterial
              ref={materialRef}
              map={gradient}
              metalness={0.8}
              roughness={0.2}
              emissive="#9333ea"
              emissiveIntensity={0.3}
            />
          </Text3D>
        </Center>
      </group>
    </Float>
  );
}
