'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, Float, Preload, Sparkles } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';
import { use3DStore } from '@/store/use3DStore';

// Global mouse tracker for smooth pointer handling
const globalMouse = { x: 0, y: 0 };
if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', (e) => {
    globalMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    globalMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });
}

// Pre-defined camera/model positions per section for cinematic framing
const SECTION_CONFIGS = {
  hero: { pos: [0, 1.8, 0], rot: [0.1, 0, 0], scale: 6.0, spread: 0 },
  about: { pos: [2.5, 1, 0], rot: [0.2, -0.5, 0], scale: 4.0, spread: 0.3 },
  philosophy: { pos: [0, 0, 0], rot: [0, 0, 0], scale: 4.5, spread: 0 },
  categories: { pos: [-3.0, 0.5, 0], rot: [-0.1, 0.5, 0], scale: 3.5, spread: 0.6 },
  performances: { pos: [3.0, -0.5, 0], rot: [0.1, -0.6, 0.1], scale: 3.5, spread: 1.0 },
  judges: { pos: [0, 2.0, 0], rot: [0.3, 0, 0], scale: 3.0, spread: 0.5 },
  sponsors: { pos: [0, -1, 0], rot: [-0.2, 0, 0], scale: 2.5, spread: 0.2 },
  footer: { pos: [0, 0, 0], rot: [0, 0, 0], scale: 2.0, spread: 0 },
};

function Model({ url }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef();
  
  // Connect to global state
  const currentSection = use3DStore((state) => state.currentSection);
  const activePhilosophyIndex = use3DStore((state) => state.activePhilosophyIndex);
  const isActivating = use3DStore((state) => state.isActivating);
  const introCompleted = use3DStore((state) => state.introCompleted);
  const setIntroCompleted = use3DStore((state) => state.setIntroCompleted);

  // Parse and cache children meshes
  const pieces = useMemo(() => {
    const arr = [];
    scene.traverse((child) => {
      if (child.isMesh) {
        // Cache original transforms
        child.userData.initPos = child.position.clone();
        child.userData.initRot = child.rotation.clone();
        
        // Improve visuals to match the Intro style
        if (child.material) {
          child.material = child.material.clone();
          if (!child.material.emissive) child.material.emissive = new THREE.Color(0x000000);
          
          // Make it glow orange except for the outer frame if possible
          // We apply a baseline glow to give it that premium feel
          child.material.emissive.setRGB(1, 0.24, 0.06).multiplyScalar(0.4);
          child.material.transparent = true;
          child.material.needsUpdate = true;
        }
        
        arr.push(child);
      }
    });
    return arr;
  }, [scene]);

  // Handle Intro Animation
  useEffect(() => {
    if (introCompleted) return;
    
    // Spread pieces randomly at the start
    pieces.forEach((piece) => {
      piece.position.set(
        piece.userData.initPos.x + (Math.random() - 0.5) * 15,
        piece.userData.initPos.y + (Math.random() - 0.5) * 15,
        piece.userData.initPos.z + (Math.random() - 0.5) * 15
      );
      piece.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
    });

    // Animate back to original
    const tl = gsap.timeline({
      onComplete: () => {
        setIntroCompleted(true);
      }
    });

    pieces.forEach((piece, i) => {
      // Find the center diamond (assuming it's the last piece or central piece)
      const isCenter = i === pieces.length - 1; 
      
      tl.to(piece.position, {
        x: piece.userData.initPos.x,
        y: piece.userData.initPos.y,
        z: piece.userData.initPos.z,
        duration: isCenter ? 2.5 : 1.5 + Math.random() * 1,
        ease: "power3.out"
      }, isCenter ? 0.5 : 0);
      
      tl.to(piece.rotation, {
        x: piece.userData.initRot.x,
        y: piece.userData.initRot.y,
        z: piece.userData.initRot.z,
        duration: isCenter ? 2.5 : 1.5 + Math.random() * 1,
        ease: "power3.out"
      }, isCenter ? 0.5 : 0);
    });
  }, [pieces, introCompleted, setIntroCompleted]);

  // Handle Activation Assembly Animation
  useEffect(() => {
    if (!isActivating || pieces.length === 0) return;

    // First scatter pieces far away
    pieces.forEach((piece) => {
      piece.position.set(
        piece.userData.initPos.x + (Math.random() - 0.5) * 50,
        piece.userData.initPos.y + (Math.random() - 0.5) * 50,
        piece.userData.initPos.z + (Math.random() - 0.5) * 50
      );
      piece.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
    });

    // Animate back to original forcefully
    const tl = gsap.timeline();

    pieces.forEach((piece, i) => {
      const isCenter = i === pieces.length - 1; 
      
      tl.to(piece.position, {
        x: piece.userData.initPos.x,
        y: piece.userData.initPos.y,
        z: piece.userData.initPos.z,
        duration: isCenter ? 2.5 : 1.5 + Math.random() * 1,
        ease: "expo.out"
      }, isCenter ? 0.5 : 0);
      
      tl.to(piece.rotation, {
        x: piece.userData.initRot.x,
        y: piece.userData.initRot.y,
        z: piece.userData.initRot.z,
        duration: isCenter ? 2.5 : 1.5 + Math.random() * 1,
        ease: "expo.out"
      }, isCenter ? 0.5 : 0);
    });
  }, [isActivating, pieces]);

  // Main Render Loop (60FPS)
  useFrame((state, delta) => {
    if (!groupRef.current || !introCompleted) return;

    // 1. SCROLL INTERPOLATION (Section based cinematic framing)
    const targetConfig = SECTION_CONFIGS[currentSection] || SECTION_CONFIGS.hero;
    
    // Lerp group transforms
    const dt = 1.0 - Math.exp(-4 * delta); // Frame-independent lerp factor
    
    groupRef.current.position.x += (targetConfig.pos[0] - groupRef.current.position.x) * dt;
    groupRef.current.position.y += (targetConfig.pos[1] - groupRef.current.position.y) * dt;
    groupRef.current.position.z += (targetConfig.pos[2] - groupRef.current.position.z) * dt;
    
    groupRef.current.rotation.x += (targetConfig.rot[0] - groupRef.current.rotation.x) * dt;
    groupRef.current.rotation.y += (targetConfig.rot[1] - groupRef.current.rotation.y) * dt;
    groupRef.current.rotation.z += (targetConfig.rot[2] - groupRef.current.rotation.z) * dt;
    
    const cs = groupRef.current.scale.x;
    const ns = cs + (targetConfig.scale - cs) * dt;
    groupRef.current.scale.set(ns, ns, ns);

    // 2. MOUSE PARALLAX & IDLE BREATHING (Mesh level)
    const time = state.clock.elapsedTime;
    
    pieces.forEach((child, i) => {
      // If we are in Philosophy mode and this piece is focused, override idle
      if (currentSection === 'philosophy' && activePhilosophyIndex !== null) {
        // Bonus Experience: Zoom in on specific piece
        const isFocused = i === activePhilosophyIndex % pieces.length;
        
        const targetZ = isFocused ? 2 : -2; // Bring forward or push back
        const targetOpacity = isFocused ? 1 : 0.2; // Opacity handling requires transparent materials, assuming standard meshes for now
        
        child.position.z += (child.userData.initPos.z + targetZ - child.position.z) * dt * 2;
        
        // Add subtle rotation to the focused piece
        if (isFocused) {
           child.rotation.y = child.userData.initRot.y + Math.sin(time * 2) * 0.1;
        } else {
           child.rotation.y += (child.userData.initRot.y - child.rotation.y) * dt;
        }
        
      } else {
        // Standard Idle & Mouse interaction
        const moveFactor = ((i % 6) + 1) * 0.1; 
        const rotFactor = ((i % 3) + 1) * 0.05;

        // Spread effect based on section
        const spreadAmount = targetConfig.spread || 0;
        
        // Simple outward push from origin based on initial position vector
        const dx = child.userData.initPos.x;
        const dy = child.userData.initPos.y;
        const dz = child.userData.initPos.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1;
        
        const spreadX = (dx / dist) * spreadAmount;
        const spreadY = (dy / dist) * spreadAmount;
        const spreadZ = (dz / dist) * spreadAmount;

        // Breathing sine wave
        const breathY = Math.sin(time * 1.5 + i) * 0.03;

        // Spread out based on mouse and spread section config
        const targetX = child.userData.initPos.x + spreadX + globalMouse.x * moveFactor;
        const targetY = child.userData.initPos.y + spreadY + globalMouse.y * moveFactor + breathY;
        
        const targetRotX = child.userData.initRot.x + globalMouse.y * rotFactor;
        const targetRotY = child.userData.initRot.y + globalMouse.x * rotFactor;
        
        child.position.x += (targetX - child.position.x) * dt * 2;
        child.position.y += (targetY - child.position.y) * dt * 2;
        child.position.z += (child.userData.initPos.z + spreadZ - child.position.z) * dt * 2; // return to normal z + spread

        child.rotation.x += (targetRotX - child.rotation.x) * dt * 2;
        child.rotation.y += (targetRotY - child.rotation.y) * dt * 2;
      }
    });
  });

  return (
    <group ref={groupRef} scale={[3.5, 3.5, 3.5]}>
      <primitive object={scene} />
      {/* Add particles matching the intro */}
      <Sparkles count={400} scale={20} size={5} speed={0.2} opacity={0.3} color="#ffaa55" />
    </group>
  );
}

function MouseCameraParallax() {
  const { camera } = useThree();
  const currentSection = use3DStore((state) => state.currentSection);
  const activePhilosophyIndex = use3DStore((state) => state.activePhilosophyIndex);
  
  useFrame((state, delta) => {
    // Determine target camera position
    let targetX = globalMouse.x * 1.5;
    let targetY = globalMouse.y * 1.5;
    let targetZ = 10;

    // Philosophy Zoom effect
    if (currentSection === 'philosophy' && activePhilosophyIndex !== null) {
       targetZ = 6; // Push camera in
       targetX = globalMouse.x * 0.5; // Reduce parallax
       targetY = globalMouse.y * 0.5;
    }
    
    // Smooth camera movement
    const dt = 1.0 - Math.exp(-3 * delta);
    camera.position.x += (targetX - camera.position.x) * dt;
    camera.position.y += (targetY - camera.position.y) * dt;
    camera.position.z += (targetZ - camera.position.z) * dt;
    camera.lookAt(0, 0, 0);
  });
  
  return null;
}

export default function Hero3DModel() {
  const introCompleted = use3DStore((state) => state.introCompleted);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      {/* Optional: Intro Overlay Fade */}
      {!introCompleted && (
         <div style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 10, pointerEvents: 'none', transition: 'opacity 2s', opacity: introCompleted ? 0 : 1 }} />
      )}
      
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <MouseCameraParallax />
        
        <Environment preset="city" />

        <ambientLight intensity={0.6} />
        
        {/* Soft orange emissive glow */}
        <directionalLight 
          castShadow 
          position={[5, 5, 5]} 
          intensity={1.5} 
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-2, -2, 2]} color="#ffa500" intensity={60} distance={15} />
        <pointLight position={[2, 2, 2]} color="#ff7b00" intensity={40} distance={15} />

        {/* Central pulsing light (Statistics/Activation feature) */}
        <pointLight position={[0, 0, 0]} color="#FF7A00" intensity={20} distance={5} />

        <Model url="/models/da-5101.glb" />
        
        <Preload all />
      </Canvas>
    </div>
  );
}
