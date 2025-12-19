import * as THREE from 'three';

// Constants for the Tree Shape
const TREE_HEIGHT = 12;
const TREE_RADIUS_BASE = 4.5;
const TREE_Y_OFFSET = -5; // Shift tree down so center is visible

// Helper to get a random point inside a large sphere (Chaos State)
export const getChaosPosition = (radius: number = 25): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

// Helper to get a point on the surface/volume of a cone (Tree State)
export const getTreePosition = (height: number, maxRadius: number, yOffset: number): THREE.Vector3 => {
  // Height factor (0 at top, 1 at bottom)
  const h = Math.random(); 
  const y = height * (1 - h) + yOffset;
  
  // Radius at this height
  const rAtHeight = maxRadius * h;
  
  // Random angle
  const theta = Math.random() * Math.PI * 2;
  
  // Random depth (mostly surface, but some depth for volume)
  // Bias towards surface for better visuals
  const radius = rAtHeight * (0.4 + 0.6 * Math.sqrt(Math.random()));

  const x = radius * Math.cos(theta);
  const z = radius * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
};

export const CONSTANTS = {
  TREE_HEIGHT,
  TREE_RADIUS_BASE,
  TREE_Y_OFFSET,
};