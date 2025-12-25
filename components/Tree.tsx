
import React, { useMemo, useRef } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { TreeLines } from './TreeLines';
import { TreeState } from '../types';
import * as THREE from 'three';
import { TREE_CONFIG, COLORS } from '../constants';

// Added index signature to allow all R3F intrinsic elements like 'group', 'mesh', 'octahedronGeometry', etc.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {
      [key: string]: any;
    }
  }
}

interface TreeProps {
  state: TreeState;
}

export const Tree: React.FC<TreeProps> = ({ state }) => {
  const transitionProgress = useRef(0);
  
  const positions = useMemo(() => {
    const { HEIGHT, RADIUS, FOLIAGE_COUNT, CHAOS_RADIUS, RIBBON_COUNT } = TREE_CONFIG;
    
    const targetPos = new Float32Array(FOLIAGE_COUNT * 3);
    const chaosPos = new Float32Array(FOLIAGE_COUNT * 3);
    const colors = new Float32Array(FOLIAGE_COUNT * 3);
    const sizes = new Float32Array(FOLIAGE_COUNT);
    const offsets = new Float32Array(FOLIAGE_COUNT);

    const emeraldDeep = new THREE.Color('#011a12');
    const emeraldLight = new THREE.Color('#004d40');
    const goldAccent = new THREE.Color('#FFD700');
    const diamondWhite = new THREE.Color('#FFFFFF');

    const ribbonParticleCount = Math.floor(FOLIAGE_COUNT * 0.45);
    const volumeParticleCount = FOLIAGE_COUNT - ribbonParticleCount;

    for (let i = 0; i < FOLIAGE_COUNT; i++) {
      const idx = i * 3;
      let tx, ty, tz;
      let col = emeraldDeep.clone();
      let s = Math.random() * 0.5 + 0.3; // 基础大小

      if (i < volumeParticleCount) {
        // --- 基础体积星尘 ---
        const h = Math.random() * HEIGHT;
        const radialDist = Math.sqrt(Math.random());
        const currentRadius = RADIUS * (1 - h / HEIGHT) * radialDist;
        const angle = Math.random() * Math.PI * 2;
        
        tx = Math.cos(angle) * currentRadius;
        ty = h;
        tz = Math.sin(angle) * currentRadius;

        const mixFactor = Math.random() * 0.5 + (radialDist * 0.5);
        col.lerp(emeraldLight, mixFactor);
        
        // 随机超级明亮的星点
        if (Math.random() > 0.99) {
          col.lerp(diamondWhite, 0.9);
          s *= 2.5;
        } else if (Math.random() > 0.98) {
          col.lerp(goldAccent, 0.8);
          s *= 1.8;
        }
      } else {
        // --- 螺旋光带星尘 ---
        const ribbonIdx = i % RIBBON_COUNT;
        const t = Math.random();
        const h = t * HEIGHT;
        const startAngle = (ribbonIdx / RIBBON_COUNT) * Math.PI * 2;
        const spirals = 2.5;
        const angle = startAngle + t * Math.PI * 2 * spirals;
        
        const spread = 0.35 * (1 - t + 0.1); 
        const currentRadius = RADIUS * (1 - t) * 1.1 + (Math.random() - 0.5) * spread;
        
        tx = Math.cos(angle) * currentRadius;
        ty = h + (Math.random() - 0.5) * spread;
        tz = Math.sin(angle) * currentRadius;

        // 光带粒子更偏向璀璨的金色
        col = emeraldLight.clone().lerp(goldAccent, Math.random() * 0.9);
        s *= 1.4;
        
        if (Math.random() > 0.95) {
          col.lerp(diamondWhite, 0.8);
          s *= 2.0;
        }
      }

      targetPos[idx] = tx;
      targetPos[idx + 1] = ty;
      targetPos[idx + 2] = tz;

      // 混沌弥散
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = CHAOS_RADIUS * (0.6 + Math.pow(Math.random(), 0.3) * 0.4);

      chaosPos[idx] = r * Math.sin(phi) * Math.cos(theta);
      chaosPos[idx + 1] = r * Math.sin(phi) * Math.sin(theta);
      chaosPos[idx + 2] = r * Math.cos(phi);

      colors[idx] = col.r;
      colors[idx + 1] = col.g;
      colors[idx + 2] = col.b;
      
      sizes[i] = s;
      offsets[i] = Math.random();
    }

    return { targetPos, chaosPos, colors, sizes, offsets };
  }, []);

  useFrame((_, delta) => {
    const targetValue = state === TreeState.FORMED ? 1 : 0;
    transitionProgress.current = THREE.MathUtils.lerp(
      transitionProgress.current,
      targetValue,
      delta * 1.5
    );
  });

  return (
    <group position={[0, -1, 0]}>
      <Foliage 
        targetPos={positions.targetPos} 
        chaosPos={positions.chaosPos} 
        colors={positions.colors}
        sizes={positions.sizes}
        offsets={positions.offsets}
        progressRef={transitionProgress}
      />
      <TreeLines progressRef={transitionProgress} />
      <Ornaments treeState={state} />
      <TreeTopper progressRef={transitionProgress} />
    </group>
  );
};

const TreeTopper: React.FC<{ progressRef: React.RefObject<number> }> = ({ progressRef }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current || progressRef.current === null) return;
    
    const p = progressRef.current;
    const y = THREE.MathUtils.lerp(15, TREE_CONFIG.HEIGHT + 0.5, p);
    const s = THREE.MathUtils.lerp(0, 1.2, p);
    
    meshRef.current.position.set(0, y, 0);
    meshRef.current.scale.set(s, s, s);
    meshRef.current.rotation.y += 0.02;
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial 
        color="#FFD700" 
        emissive="#FFD700" 
        emissiveIntensity={4} 
        metalness={1} 
        roughness={0} 
      />
      <pointLight intensity={15} color="#FFD700" distance={8} />
    </mesh>
  );
};
