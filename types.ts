
import { Vector3, Color } from 'three';

export enum TreeState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED'
}

export interface TreeElement {
  chaosPos: Vector3;
  targetPos: Vector3;
  color: Color;
  size: number;
  weight: number; // For physics-like motion responsiveness
}

export interface OrnamentType {
  type: 'box' | 'sphere' | 'light';
  weight: number;
  color: string;
}
