
import React, { useState, Suspense } from 'react';
import { Canvas, ThreeElements } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars } from '@react-three/drei';
import { Scene } from './components/Scene';
import { TreeState } from './types';
import { COLORS } from './constants';

// Fix for JSX intrinsic elements missing from the global namespace in some environments
// Added index signature to allow all R3F intrinsic elements like 'color', 'ambientLight', 'spotLight', etc.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {
      [key: string]: any;
    }
  }
}

const App: React.FC = () => {
  const [state, setState] = useState<TreeState>(TreeState.CHAOS);

  return (
    <div className="relative w-full h-screen">
      {/* 3D Canvas */}
      <Canvas shadows gl={{ antialias: true }}>
        <color attach="background" args={[COLORS.LUXURY_BLACK]} />
        <PerspectiveCamera makeDefault position={[0, 5, 25]} fov={50} />
        
        <Suspense fallback={null}>
          <Scene treeState={state} />
          <Environment preset="night" />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </Suspense>

        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          minDistance={10} 
          maxDistance={50}
          maxPolarAngle={Math.PI / 1.8}
        />
        
        <ambientLight intensity={0.2} />
        <spotLight position={[10, 20, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8">
        <header className="text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-[#FFD700] to-[#D4AF37] drop-shadow-lg tracking-widest uppercase">
            Grand Luxury
          </h1>
          <p className="text-white/50 text-sm md:text-base tracking-[0.5em] mt-2 uppercase">
            Interactive Christmas Installation
          </p>
        </header>

        <div className="flex flex-col items-center gap-6 mb-12">
          <div className="flex gap-4 pointer-events-auto">
            <button
              onClick={() => setState(TreeState.FORMED)}
              className={`px-8 py-3 rounded-full transition-all duration-500 border-2 uppercase text-sm font-bold tracking-widest ${
                state === TreeState.FORMED 
                ? 'bg-[#FFD700] text-[#011612] border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.4)]' 
                : 'text-[#FFD700] border-[#FFD700]/30 hover:border-[#FFD700]'
              }`}
            >
              Assemble Tree
            </button>
            <button
              onClick={() => setState(TreeState.CHAOS)}
              className={`px-8 py-3 rounded-full transition-all duration-500 border-2 uppercase text-sm font-bold tracking-widest ${
                state === TreeState.CHAOS 
                ? 'bg-[#FFD700] text-[#011612] border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.4)]' 
                : 'text-[#FFD700] border-[#FFD700]/30 hover:border-[#FFD700]'
              }`}
            >
              Release Magic
            </button>
          </div>
          
          <div className="text-white/30 text-xs italic">
            Rotate to explore &bull; Drag to interact
          </div>
        </div>
      </div>

      {/* Vignette Effect */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
    </div>
  );
};

export default App;
