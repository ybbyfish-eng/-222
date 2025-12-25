
import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { TREE_CONFIG, ORNAMENT_PROPS } from '../constants';
import { TreeState } from '../types';

// Fix for JSX intrinsic elements missing from the global namespace
// Added index signature to allow all R3F intrinsic elements like 'instancedMesh', 'boxGeometry', 'meshStandardMaterial', etc.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {
      [key: string]: any;
    }
  }
}

interface OrnamentsProps {
  treeState: TreeState;
}

export const Ornaments: React.FC<OrnamentsProps> = ({ treeState }) => {
  const { HEIGHT, RADIUS, ORNAMENT_COUNT, CHAOS_RADIUS } = TREE_CONFIG;
  
  const dummy = new THREE.Object3D();

  // Create ornament data
  const data = useMemo(() => {
    return Array.from({ length: ORNAMENT_COUNT }).map((_, i) => {
      const prop = ORNAMENT_PROPS[i % ORNAMENT_PROPS.length];
      
      // Target Pos
      const h = Math.random() * (HEIGHT - 1) + 1;
      const r_at_h = RADIUS * (1 - h / HEIGHT);
      const angle = Math.random() * Math.PI * 2;
      const targetPos = new THREE.Vector3(
        Math.cos(angle) * r_at_h * 0.95,
        h,
        Math.sin(angle) * r_at_h * 0.95
      );

      // Chaos Pos
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const dist = CHAOS_RADIUS * (0.5 + Math.random() * 0.5);
      const chaosPos = new THREE.Vector3(
        dist * Math.sin(phi) * Math.cos(theta),
        dist * Math.sin(phi) * Math.sin(theta),
        dist * Math.cos(phi)
      );

      return {
        targetPos,
        chaosPos,
        type: prop.type,
        color: new THREE.Color(prop.color),
        weight: prop.weight,
        phase: Math.random() * Math.PI * 2
      };
    });
  }, [HEIGHT, RADIUS, ORNAMENT_COUNT, CHAOS_RADIUS]);

  const sphereRef = useRef<THREE.InstancedMesh>(null);
  const boxRef = useRef<THREE.InstancedMesh>(null);
  const lightRef = useRef<THREE.InstancedMesh>(null);
  
  const progress = useRef(0);

  // Initialize colors once
  useEffect(() => {
    data.forEach((d, i) => {
      if (d.type === 'box') {
        boxRef.current?.setColorAt(i, d.color);
      } else if (d.type === 'sphere') {
        sphereRef.current?.setColorAt(i, d.color);
      } else {
        lightRef.current?.setColorAt(i, d.color);
      }
    });
    if (boxRef.current) boxRef.current.instanceColor!.needsUpdate = true;
    if (sphereRef.current) sphereRef.current.instanceColor!.needsUpdate = true;
    if (lightRef.current) lightRef.current.instanceColor!.needsUpdate = true;
  }, [data]);

  useFrame((state, delta) => {
    const target = treeState === TreeState.FORMED ? 1 : 0;
    progress.current = THREE.MathUtils.lerp(progress.current, target, delta * 1.2);

    const time = state.clock.getElapsedTime();

    data.forEach((d, i) => {
      const individualProgress = Math.min(1, progress.current * (1.2 - d.weight * 0.1));
      const pos = new THREE.Vector3().lerpVectors(d.chaosPos, d.targetPos, individualProgress);
      
      const floatAmp = (1 - individualProgress) * 2 + 0.1;
      pos.y += Math.sin(time + d.phase) * floatAmp * (1 / d.weight);
      
      dummy.position.copy(pos);
      
      // Determine if we should show this instance (scale to 0 if wrong type)
      // Note: We use the same index i for simplicity, but only one mesh will have non-zero scale for this d
      const scale = 1.0; 

      if (d.type === 'box') {
        dummy.rotation.set(time * 0.5, time * 0.2, 0);
        dummy.scale.setScalar(0.4 * scale);
        dummy.updateMatrix();
        boxRef.current?.setMatrixAt(i, dummy.matrix);
        // Hide from others
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        sphereRef.current?.setMatrixAt(i, dummy.matrix);
        lightRef.current?.setMatrixAt(i, dummy.matrix);
      } else if (d.type === 'sphere') {
        dummy.scale.setScalar(0.25 * scale);
        dummy.updateMatrix();
        sphereRef.current?.setMatrixAt(i, dummy.matrix);
        // Hide from others
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        boxRef.current?.setMatrixAt(i, dummy.matrix);
        lightRef.current?.setMatrixAt(i, dummy.matrix);
      } else {
        dummy.scale.setScalar(0.1 * scale);
        dummy.updateMatrix();
        lightRef.current?.setMatrixAt(i, dummy.matrix);
        // Hide from others
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        boxRef.current?.setMatrixAt(i, dummy.matrix);
        sphereRef.current?.setMatrixAt(i, dummy.matrix);
      }
    });

    if (boxRef.current) boxRef.current.instanceMatrix.needsUpdate = true;
    if (sphereRef.current) sphereRef.current.instanceMatrix.needsUpdate = true;
    if (lightRef.current) lightRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={boxRef} args={[undefined, undefined, ORNAMENT_COUNT]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.9} roughness={0.1} />
      </instancedMesh>

      <instancedMesh ref={sphereRef} args={[undefined, undefined, ORNAMENT_COUNT]} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial metalness={0.8} roughness={0.2} />
      </instancedMesh>

      <instancedMesh ref={lightRef} args={[undefined, undefined, ORNAMENT_COUNT]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial emissiveIntensity={5} />
      </instancedMesh>
    </>
  );
};
