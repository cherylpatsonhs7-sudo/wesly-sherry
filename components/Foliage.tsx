import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONSTANTS, getChaosPosition, getTreePosition } from '../utils';

// Custom Shader Material for performant morphing
const FoliageShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 0 }, // 0 = Chaos, 1 = Formed
    uColorBase: { value: new THREE.Color('#004225') }, // Deep Emerald
    uColorTip: { value: new THREE.Color('#0f5e3a') }, // Lighter Emerald
    uColorGold: { value: new THREE.Color('#FFD700') }, // Gold sparkle
  },
  vertexShader: `
    uniform float uTime;
    uniform float uProgress;
    attribute vec3 aChaosPos;
    attribute vec3 aTargetPos;
    attribute float aRandom;
    
    varying vec2 vUv;
    varying float vRandom;
    varying float vDepth;

    // Cubic ease out function for smooth transition
    float easeOutCubic(float x) {
      return 1.0 - pow(1.0 - x, 3.0);
    }

    void main() {
      vUv = uv;
      vRandom = aRandom;
      
      // Calculate eased progress based on random offset to break uniformity
      float localProgress = clamp((uProgress - aRandom * 0.2) / 0.8, 0.0, 1.0);
      float eased = easeOutCubic(localProgress);

      vec3 finalPos = mix(aChaosPos, aTargetPos, eased);
      
      // Add a subtle wind/breathing effect when formed
      if (uProgress > 0.8) {
        float wind = sin(uTime * 2.0 + finalPos.y) * 0.05 * (1.0 - localProgress);
        finalPos.x += wind;
      }

      vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
      vDepth = -mvPosition.z;

      // Size attenuation
      gl_PointSize = (6.0 + aRandom * 4.0) * (10.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColorBase;
    uniform vec3 uColorTip;
    uniform vec3 uColorGold;
    uniform float uTime;
    
    varying float vRandom;
    
    void main() {
      // Circular particle
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      if (dist > 0.5) discard;

      // Gradient from center to edge
      vec3 color = mix(uColorBase, uColorTip, dist * 2.0);
      
      // Occasional gold sparkle based on time and randomness
      float sparkle = sin(uTime * 3.0 + vRandom * 100.0);
      if (sparkle > 0.95) {
        color = uColorGold;
      }

      gl_FragColor = vec4(color, 1.0);
    }
  `
};

interface FoliageProps {
  progress: number;
}

export const Foliage: React.FC<FoliageProps> = ({ progress }) => {
  const count = 15000; // High particle count for "Luxury" density
  const meshRef = useRef<THREE.Points>(null);
  
  // Generate attributes once
  const { positions, chaosPositions, randoms } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const chaos = new Float32Array(count * 3);
    const rands = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Target (Tree)
      const target = getTreePosition(
        CONSTANTS.TREE_HEIGHT, 
        CONSTANTS.TREE_RADIUS_BASE, 
        CONSTANTS.TREE_Y_OFFSET
      );
      pos[i * 3] = target.x;
      pos[i * 3 + 1] = target.y;
      pos[i * 3 + 2] = target.z;

      // Chaos (Sphere)
      const c = getChaosPosition(30);
      chaos[i * 3] = c.x;
      chaos[i * 3 + 1] = c.y;
      chaos[i * 3 + 2] = c.z;

      rands[i] = Math.random();
    }
    return { positions: pos, chaosPositions: chaos, randoms: rands };
  }, []);

  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uColorBase: { value: new THREE.Color('#003318') }, // Darker Emerald
      uColorTip: { value: new THREE.Color('#006b3e') }, // Lighter Emerald
      uColorGold: { value: new THREE.Color('#FFD700') }, // Gold
    };
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      // Smoothly interpolate the uniform value towards the React prop
      material.uniforms.uProgress.value = THREE.MathUtils.lerp(
        material.uniforms.uProgress.value,
        progress,
        0.05
      );
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position" // This is actually the target pos in our logic, but Three needs a 'position'
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTargetPos"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aChaosPos"
          count={count}
          array={chaosPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={count}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        attach="material"
        args={[FoliageShaderMaterial]}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        transparent={true}
      />
    </points>
  );
};