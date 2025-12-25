
import React, { useMemo, useRef } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { TREE_CONFIG, COLORS } from '../constants';

// Fix for JSX intrinsic elements missing from the global namespace
// Added index signature to allow all R3F intrinsic elements like 'group', 'line', 'bufferGeometry', etc.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {
      [key: string]: any;
    }
  }
}

interface TreeLinesProps {
  progressRef: React.MutableRefObject<number>;
}

export const TreeLines: React.FC<TreeLinesProps> = ({ progressRef }) => {
  const { HEIGHT, RADIUS, RIBBON_COUNT, RIBBON_POINTS, CHAOS_RADIUS } = TREE_CONFIG;

  const ribbons = useMemo(() => {
    return Array.from({ length: RIBBON_COUNT }).map((_, rIndex) => {
      const targetPoints: THREE.Vector3[] = [];
      const chaosPoints: THREE.Vector3[] = [];
      
      const startAngle = (rIndex / RIBBON_COUNT) * Math.PI * 2;
      const spirals = 2.5;

      for (let i = 0; i < RIBBON_POINTS; i++) {
        const t = i / (RIBBON_POINTS - 1);
        const h = t * HEIGHT;
        const currentRadius = RADIUS * (1 - t) * 1.1; 
        const angle = startAngle + t * Math.PI * 2 * spirals;

        targetPoints.push(new THREE.Vector3(
          Math.cos(angle) * currentRadius,
          h,
          Math.sin(angle) * currentRadius
        ));

        const cTheta = Math.random() * Math.PI * 2;
        const cPhi = Math.acos(2 * Math.random() - 1);
        const dist = CHAOS_RADIUS * (0.8 + Math.random() * 0.4);
        chaosPoints.push(new THREE.Vector3(
          dist * Math.sin(cPhi) * Math.cos(cTheta),
          dist * Math.sin(cPhi) * Math.sin(cTheta),
          dist * Math.cos(cPhi)
        ));
      }

      return { targetPoints, chaosPoints, phase: Math.random() * Math.PI * 2 };
    });
  }, [HEIGHT, RADIUS, RIBBON_COUNT, RIBBON_POINTS, CHAOS_RADIUS]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const p = progressRef.current;

    groupRef.current.children.forEach((child, idx) => {
      const line = child as THREE.Line;
      const positions = line.geometry.attributes.position.array as Float32Array;
      const ribbon = ribbons[idx];

      for (let i = 0; i < RIBBON_POINTS; i++) {
        const target = ribbon.targetPoints[i];
        const chaos = ribbon.chaosPoints[i];
        
        const rotationAngle = time * 0.15 * p; // 略微放慢旋转，让周围粒子跟得更稳
        const cosR = Math.cos(rotationAngle);
        const sinR = Math.sin(rotationAngle);

        const currentPos = new THREE.Vector3().lerpVectors(chaos, target, p);
        
        if (p > 0.05) {
          const x = currentPos.x * cosR - currentPos.z * sinR;
          const z = currentPos.x * sinR + currentPos.z * cosR;
          currentPos.x = x;
          currentPos.z = z;
        }

        positions[i * 3] = currentPos.x;
        positions[i * 3 + 1] = currentPos.y;
        positions[i * 3 + 2] = currentPos.z;
      }
      line.geometry.attributes.position.needsUpdate = true;
      
      // 线条材质跟随时间脉动，增强呼吸感
      if (line.material instanceof THREE.LineBasicMaterial) {
        line.material.opacity = (0.4 + Math.sin(time * 3 + ribbon.phase) * 0.2) * p;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {ribbons.map((_, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={RIBBON_POINTS}
              array={new Float32Array(RIBBON_POINTS * 3)}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial 
            color={COLORS.GOLD_HIGH} 
            transparent 
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            opacity={0} // 初始透明，由 useFrame 控制
          />
        </line>
      ))}
    </group>
  );
};
