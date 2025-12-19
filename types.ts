import * as THREE from 'three';

export enum AppState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED',
}

export type OrnamentType = 'GIFT' | 'BALL' | 'LIGHT';

export interface OrnamentData {
  id: string;
  type: OrnamentType;
  color: THREE.Color;
  chaosPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  scale: number;
  rotation: THREE.Euler;
  speed: number; // For Lerp weight
  currentPos: THREE.Vector3; // Mutable for animation
}

export interface FoliageUniforms {
  uTime: { value: number };
  uProgress: { value: number };
  uColor1: { value: THREE.Color };
  uColor2: { value: THREE.Color };
}