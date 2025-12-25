
import React from 'react';
import { Tree } from './Tree';
import { PostProcessing } from './PostProcessing';
import { TreeState } from '../types';
import { ContactShadows } from '@react-three/drei';
import { ThreeElements } from '@react-three/fiber';

// Fix for JSX intrinsic elements missing from the global namespace
// Added index signature to allow all R3F intrinsic elements like 'mesh', 'planeGeometry', 'meshStandardMaterial', etc.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {
      [key: string]: any;
    }
  }
}

interface SceneProps {
  treeState: TreeState;
}

export const Scene: React.FC<SceneProps> = ({ treeState }) => {
  return (
    <>
      <Tree state={treeState} />
      
      {/* Decorative Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#000" metalness={0.9} roughness={0.1} />
      </mesh>

      <ContactShadows 
        opacity={0.4} 
        scale={20} 
        blur={2} 
        far={4.5} 
        resolution={256} 
        color="#000000" 
      />

      <PostProcessing />
    </>
  );
};
