import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONSTANTS, getChaosPosition, getTreePosition } from '../utils';
import { OrnamentData, OrnamentType } from '../types';

interface OrnamentsProps {
  targetProgress: number; // 0 to 1
}

// Reusable geometry and materials for instances
const geometrySphere = new THREE.SphereGeometry(1, 32, 32);
const geometryBox = new THREE.BoxGeometry(1, 1, 1);
const geometryTiny = new THREE.SphereGeometry(0.1, 8, 8); // Lights

const materialGold = new THREE.MeshStandardMaterial({ 
  color: '#FFD700', 
  metalness: 1, 
  roughness: 0.1,
  emissive: '#554400',
  emissiveIntensity: 0.2
});
const materialRed = new THREE.MeshStandardMaterial({ 
  color: '#8B0000', 
  metalness: 0.6, 
  roughness: 0.2 
});
const materialSilver = new THREE.MeshStandardMaterial({ 
  color: '#C0C0C0', 
  metalness: 0.9, 
  roughness: 0.1 
});
const materialLight = new THREE.MeshBasicMaterial({ color: '#FFFACD' }); // Lemon Chiffon light

export const Ornaments: React.FC<OrnamentsProps> = ({ targetProgress }) => {
  const count = 400; // Total ornaments
  
  // Refs for InstancedMeshes
  const meshBallsRef = useRef<THREE.InstancedMesh>(null);
  const meshGiftsRef = useRef<THREE.InstancedMesh>(null);
  const meshLightsRef = useRef<THREE.InstancedMesh>(null);

  // Data generation
  const items = useMemo(() => {
    const tempItems: OrnamentData[] = [];
    const colors = ['#FFD700', '#B22222', '#C0C0C0', '#ffffff'];
    
    for (let i = 0; i < count; i++) {
      const isLight = i % 3 === 0; // 33% lights
      const isGift = i % 10 === 0; // 10% gifts
      
      let type: OrnamentType = 'BALL';
      let scale = 0.3 + Math.random() * 0.3;
      let speed = 2.0; // Base speed

      if (isLight) {
        type = 'LIGHT';
        scale = 1.0; // Geometry is already tiny
        speed = 4.0; // Lights are very light, move fast
      } else if (isGift) {
        type = 'GIFT';
        scale = 0.4 + Math.random() * 0.3;
        speed = 0.8; // Gifts are heavy, move slow
      } else {
        speed = 1.5 + Math.random(); // Balls vary
      }

      const targetPos = getTreePosition(
        CONSTANTS.TREE_HEIGHT, 
        CONSTANTS.TREE_RADIUS_BASE + 0.5, // Ornaments sit slightly outside foliage
        CONSTANTS.TREE_Y_OFFSET
      );

      tempItems.push({
        id: `ornament-${i}`,
        type,
        color: new THREE.Color(colors[Math.floor(Math.random() * colors.length)]),
        chaosPos: getChaosPosition(35),
        targetPos: targetPos,
        scale,
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        speed,
        currentPos: new THREE.Vector3(), // Initialize later
      });
    }
    return tempItems;
  }, []);

  // Initialize current positions to chaos positions
  useLayoutEffect(() => {
    items.forEach(item => {
      item.currentPos.copy(item.chaosPos);
    });
  }, [items]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    let ballIdx = 0;
    let giftIdx = 0;
    let lightIdx = 0;

    items.forEach((item) => {
      // Determine target for this frame
      const dest = targetProgress > 0.5 ? item.targetPos : item.chaosPos;
      
      // Calculate interpolation alpha based on item weight/speed
      // We use a dampened lerp for "physics" feel
      // Heavier items (lower speed) react slower
      const alpha = THREE.MathUtils.clamp(item.speed * delta, 0, 1);
      
      item.currentPos.lerp(dest, alpha);

      // Add floating movement when formed
      if (targetProgress > 0.9) {
        item.currentPos.y += Math.sin(state.clock.elapsedTime * item.speed + parseFloat(item.id)) * 0.005;
      }

      // Update Dummy Object
      dummy.position.copy(item.currentPos);
      dummy.rotation.copy(item.rotation);
      
      // Rotate objects slowly
      dummy.rotation.y += delta * 0.2;
      
      dummy.scale.set(item.scale, item.scale, item.scale);
      dummy.updateMatrix();

      // Set Matrix to correct InstanceMesh
      if (item.type === 'BALL' && meshBallsRef.current) {
        meshBallsRef.current.setMatrixAt(ballIdx, dummy.matrix);
        // We could set color here too but standard material color is fine for now to save per-frame overhead
        // If we wanted individual colors per instance we'd use setColorAt
        meshBallsRef.current.setColorAt(ballIdx, item.color);
        ballIdx++;
      } else if (item.type === 'GIFT' && meshGiftsRef.current) {
        meshGiftsRef.current.setMatrixAt(giftIdx, dummy.matrix);
        meshGiftsRef.current.setColorAt(giftIdx, item.color);
        giftIdx++;
      } else if (item.type === 'LIGHT' && meshLightsRef.current) {
        meshLightsRef.current.setMatrixAt(lightIdx, dummy.matrix);
        lightIdx++;
      }
    });

    if (meshBallsRef.current) meshBallsRef.current.instanceMatrix.needsUpdate = true;
    if (meshBallsRef.current) meshBallsRef.current.instanceColor!.needsUpdate = true;

    if (meshGiftsRef.current) meshGiftsRef.current.instanceMatrix.needsUpdate = true;
    if (meshGiftsRef.current) meshGiftsRef.current.instanceColor!.needsUpdate = true;

    if (meshLightsRef.current) meshLightsRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* Balls */}
      <instancedMesh ref={meshBallsRef} args={[geometrySphere, materialGold, count]} />
      
      {/* Gifts */}
      <instancedMesh ref={meshGiftsRef} args={[geometryBox, materialRed, count]} />

      {/* Lights - Using a simpler geometry/material for glow */}
      <instancedMesh ref={meshLightsRef} args={[geometryTiny, materialLight, count]} />
    </group>
  );
};