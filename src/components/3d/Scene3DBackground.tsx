import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { ParticleField } from './ParticleField';
import { FloatingGeometry } from './FloatingGeometry';

interface Scene3DBackgroundProps {
  audioData?: Uint8Array;
}

export function Scene3DBackground({ audioData }: Scene3DBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#9333ea" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#f59e0b" />
          <spotLight
            position={[0, 10, 5]}
            angle={0.3}
            penumbra={1}
            intensity={0.8}
            color="#c084fc"
          />
          
          <ParticleField count={1500} color="#9333ea" audioData={audioData} />
          <FloatingGeometry audioData={audioData} />
          
          <fog attach="fog" args={['#0a0510', 10, 40]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
