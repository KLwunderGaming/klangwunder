import { Canvas } from '@react-three/fiber';
import { Suspense, Component, ReactNode } from 'react';
import { ParticleField } from './ParticleField';
import { FloatingGeometry } from './FloatingGeometry';

class WebGLErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.warn('WebGL/3D scene failed to load:', error.message);
  }
  render() {
    if (this.state.hasError) {
      return <div className="fixed inset-0 -z-10 bg-background" />;
    }
    return this.props.children;
  }
}

interface Scene3DBackgroundProps {
  audioData?: Uint8Array;
}

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export function Scene3DBackground({ audioData }: Scene3DBackgroundProps) {
  if (!isWebGLAvailable()) {
    return <div className="fixed inset-0 -z-10 bg-background" />;
  }

  return (
    <WebGLErrorBoundary>
      <div className="fixed inset-0 -z-10">
        <Canvas
          camera={{ position: [0, 0, 15], fov: 60 }}
          gl={{ antialias: true, alpha: true, failIfMajorPerformanceCaveat: false }}
          style={{ background: 'transparent' }}
          onCreated={({ gl }) => {
            if (!gl) {
              console.warn('WebGL context not available');
            }
          }}
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
    </WebGLErrorBoundary>
  );
}
