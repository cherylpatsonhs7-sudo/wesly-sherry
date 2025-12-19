import React from 'react';
import { PerspectiveCamera, OrbitControls, Environment, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { AppState } from '../types';

interface ExperienceProps {
  appState: AppState;
}

export const Experience: React.FC<ExperienceProps> = ({ appState }) => {
  // Map discrete state string to continuous 0-1 value for animations
  const targetProgress = appState === AppState.FORMED ? 1 : 0;

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={50} />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={10}
        maxDistance={40}
        rotateSpeed={0.5}
      />

      {/* LUXURY LIGHTING */}
      <ambientLight intensity={0.2} color="#001100" />
      
      {/* Main Gold Light */}
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={200} 
        color="#FFD700" 
        castShadow 
      />
      
      {/* Fill Light */}
      <pointLight position={[-10, 5, -10]} intensity={50} color="#004225" />
      
      {/* Backlight for Rim Effect */}
      <spotLight 
        position={[0, 10, -20]} 
        angle={0.5} 
        intensity={150} 
        color="#ffffff" 
      />

      {/* Environment for shiny reflections */}
      <Environment preset="city" background={false} />

      <group position={[0, -2, 0]}>
         {/* The Star on Top */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={[0, 7.5, 0]} scale={targetProgress}>
             <dodecahedronGeometry args={[0.8, 0]} />
             <meshStandardMaterial 
                color="#FFD700" 
                emissive="#FFD700" 
                emissiveIntensity={2} 
                roughness={0} 
                metalness={1} 
              />
          </mesh>
        </Float>

        {/* The Tree Components */}
        <Foliage progress={targetProgress} />
        <Ornaments targetProgress={targetProgress} />
      </group>

      {/* POST PROCESSING - Cinematic Trump Style */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.8} 
          intensity={1.2} 
          mipmapBlur 
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
      </EffectComposer>
    </>
  );
};