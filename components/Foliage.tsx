
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeElements } from '@react-three/fiber';

// Added index signature to allow all R3F intrinsic elements like 'points', 'bufferGeometry', 'bufferAttribute', etc.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {
      [key: string]: any;
    }
  }
}

interface FoliageProps {
  targetPos: Float32Array;
  chaosPos: Float32Array;
  colors: Float32Array;
  sizes: Float32Array; // 传入粒子大小属性
  offsets: Float32Array; // 传入随机偏移，用于变频闪烁
  progressRef: React.MutableRefObject<number>;
}

export const Foliage: React.FC<FoliageProps> = ({ targetPos, chaosPos, colors, sizes, offsets, progressRef }) => {
  const shaderArgs = useMemo(() => ({
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader: `
      uniform float uProgress;
      uniform float uTime;
      attribute vec3 chaosPos;
      attribute vec3 color;
      attribute float size;
      attribute float offset;
      
      varying vec3 vColor;
      varying float vDist;
      varying float vY;
      varying float vRandomOffset;

      void main() {
        vColor = color;
        vY = position.y;
        vRandomOffset = offset;
        
        // 核心位置插值
        vec3 pos = mix(chaosPos, position, uProgress);
        
        // 动态波动：增加随时间的小幅度星云扭动
        float sway = sin(uTime * 0.5 + pos.y * 0.2 + offset * 10.0) * (0.05 + 0.1 * (1.0 - uProgress));
        pos.x += sway;
        pos.z += cos(uTime * 0.4 + pos.x * 0.3) * sway;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        
        // 粒子大小计算：基础大小 * 属性缩放 * 距离衰减 * 呼吸动效
        float pulse = 0.8 + 0.4 * sin(uTime * (1.5 + offset) + offset * 100.0);
        gl_PointSize = size * (20.0 / -mvPosition.z) * pulse;
        
        gl_Position = projectionMatrix * mvPosition;
        vDist = -mvPosition.z;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vDist;
      varying float vY;
      varying float vRandomOffset;
      uniform float uTime;
      uniform float uProgress;

      void main() {
        // 创建圆形的星芒效果
        float r = length(gl_PointCoord - vec2(0.5));
        if (r > 0.5) discard;
        
        // 极锐利的中心点
        float strength = pow(1.0 - (r * 2.0), 3.0);
        
        // 变频闪烁：模拟繁星
        float twinkle = pow(abs(sin(uTime * (1.0 + vRandomOffset * 2.0) + vRandomOffset * 50.0)), 15.0);
        
        vec3 finalColor = vColor;
        
        // 增加高光亮度：如果是金色/白色粒子，在闪烁时大幅增强
        float glowThreshold = 0.85;
        if (vColor.r > 0.6 && vColor.g > 0.5) { // 金色判定
           finalColor += vec3(0.5, 0.4, 0.2) * twinkle * uProgress;
        } else {
           finalColor += vec3(0.1, 0.2, 0.1) * twinkle * uProgress;
        }

        // 基础自发光补偿
        gl_FragColor = vec4(finalColor, strength * (0.7 + twinkle * 0.3));
      }
    `
  }), []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uProgress.value = progressRef.current;
      mat.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={targetPos.length / 3} array={targetPos} itemSize={3} />
        <bufferAttribute attach="attributes-chaosPos" count={chaosPos.length / 3} array={chaosPos} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={sizes.length} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-offset" count={offsets.length} array={offsets} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial args={[shaderArgs]} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
};
