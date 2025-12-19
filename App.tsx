import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Experience } from './components/Experience';
import { AppState } from './types';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.CHAOS);

  const toggleState = () => {
    setAppState((prev) => (prev === AppState.CHAOS ? AppState.FORMED : AppState.CHAOS));
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none font-sans">
      {/* Dynamic Background Gradient */}
      <div 
        className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_#0f331e_0%,_#000000_100%)]"
        style={{
          transition: 'opacity 2s ease',
          opacity: appState === AppState.FORMED ? 1 : 0.4
        }}
      />

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-10">
        <Canvas 
          shadows 
          dpr={[1, 2]} 
          gl={{ 
            antialias: false, // Postprocessing handles AA or bloom makes it look smooth enough
            toneMappingExposure: 1.5,
            powerPreference: "high-performance"
          }} 
        >
          <Experience appState={appState} />
        </Canvas>
      </div>

      {/* UI Overlay - TRUMP STYLE LUXURY */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-8 md:p-12">
        
        {/* Header */}
        <header className="flex flex-col items-center text-center space-y-2 animate-fade-in-down">
          <div className="text-[#FFD700] tracking-[0.3em] text-xs font-bold uppercase drop-shadow-md">
            The Official 2024
          </div>
          <h1 className="font-[Cinzel] text-4xl md:text-6xl text-white font-bold drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#FFD700] to-[#B8860B]">
              GRAND LUXURY
            </span>
            <br />
            <span className="text-2xl md:text-4xl text-[#D1FAE5] font-[Playfair Display] italic">
              Interactive Christmas Tree
            </span>
          </h1>
        </header>

        {/* Controls */}
        <div className="flex flex-col items-center space-y-6 pointer-events-auto pb-10">
          <div className="bg-black/40 backdrop-blur-md border border-[#FFD700]/30 p-6 rounded-lg max-w-md text-center text-[#e2e8f0] font-light shadow-2xl">
            <p className="mb-4 text-sm font-[Playfair Display] italic">
              "An experience of unparalleled elegance. Tap the button to assemble greatness."
            </p>
            
            <button
              onClick={toggleState}
              className="group relative px-8 py-3 bg-gradient-to-r from-[#004225] to-[#006438] border border-[#FFD700] text-[#FFD700] font-bold uppercase tracking-widest text-sm transition-all duration-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <div className="relative flex items-center space-x-2">
                {appState === AppState.CHAOS ? (
                  <>
                    <span>Assemble the Tree</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <ArrowLeft className="w-4 h-4" />
                    <span>Release to Chaos</span>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center space-x-2 text-xs tracking-widest text-[#FFD700]/80">
            <Sparkles className={`w-3 h-3 ${appState === AppState.FORMED ? 'animate-pulse' : ''}`} />
            <span>STATUS: {appState === AppState.CHAOS ? 'AWAITING ASSEMBLY' : 'MAGNIFICENT FORM'}</span>
            <Sparkles className={`w-3 h-3 ${appState === AppState.FORMED ? 'animate-pulse' : ''}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;