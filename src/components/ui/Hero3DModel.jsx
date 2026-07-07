'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, Float, Preload, Sparkles, PresentationControls } from '@react-three/drei';
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
  login: { pos: [0, 0, 0], rot: [0.15, -0.2, 0], scale: 1.5, spread: 0.1 },
  hero: { pos: [0, 1.6, 0], rot: [0.15, 0, 0], scale: 1.0, spread: 0 },
  about: { pos: [2.5, 1, 0], rot: [0.2, -0.5, 0], scale: 4.0, spread: 0.3 },
  philosophy: { pos: [0, -0.2, 0], rot: [0, 0, 0], scale: 1.2, spread: 0 },
  categories: { pos: [-3.0, 0.5, 0], rot: [-0.1, 0.5, 0], scale: 3.5, spread: 0.6 },
  performances: { pos: [3.0, -0.5, 0], rot: [0.1, -0.6, 0.1], scale: 3.5, spread: 1.0 },
  judges: { pos: [0, 2.0, 0], rot: [0.3, 0, 0], scale: 3.0, spread: 0.5 },
  sponsors: { pos: [0, -1, 0], rot: [-0.2, 0, 0], scale: 2.5, spread: 0.2 },
  footer: { pos: [0, 0, 0], rot: [0, 0, 0], scale: 2.0, spread: 0 },
  inline: { pos: [0, -0.5, 0], rot: [0.2, 0, 0], scale: 2.5, spread: 0 }, // For inline usage like Activation page
};

function Model({ url, scatterIdle, inline, animateOnMount }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef();
  
  // Connect to global state
  const currentSection = use3DStore((state) => state.currentSection);
  const activePhilosophyIndex = use3DStore((state) => state.activePhilosophyIndex);
  const isActivating = use3DStore((state) => state.isActivating);
  const introCompleted = use3DStore((state) => state.introCompleted);
  const setIntroCompleted = use3DStore((state) => state.setIntroCompleted);

  // Parse, center, and cache children meshes
  const pieces = useMemo(() => {
    // 1. Center the entire scene
    const fullBox = new THREE.Box3().setFromObject(scene);
    const center = fullBox.getCenter(new THREE.Vector3());
    
    // We adjust the position of all children so the scene is centered
    // This is crucial because DA_5101.glb has an offset geometry.
    scene.position.x -= center.x;
    scene.position.y -= center.y;
    scene.position.z -= center.z;

    const arr = [];
    scene.traverse((child) => {
      if (child.isMesh) {
        // Cache original transforms
        // Since we moved the scene, we don't need to move the children locally,
        // but it's safe to just cache their local positions as they are.
        child.userData.initPos = child.position.clone();
        child.userData.initRot = child.rotation.clone();
        
        // If scatterIdle is true, set their initial position to be scattered
        if (scatterIdle) {
          child.userData.scatterPos = new THREE.Vector3(
            child.position.x + (Math.random() - 0.5) * 20,
            child.position.y + (Math.random() - 0.5) * 20,
            child.position.z + (Math.random() - 0.5) * 20
          );
          child.userData.scatterRot = new THREE.Euler(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
          );
          child.position.copy(child.userData.scatterPos);
          child.rotation.copy(child.userData.scatterRot);
        }
        
        // Do not override materials, use original colors as requested by the user.
        
        arr.push(child);
      }
    });
    return arr;
  }, [scene]);

  // Handle Dragging and Spinning of individual pieces
  const draggedPieceRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (draggedPieceRef.current) {
        const piece = draggedPieceRef.current;
        const dx = (e.clientX - dragStartRef.current.x) * 0.02;
        const dy = (e.clientY - dragStartRef.current.y) * 0.02;
        piece.userData.dragOffset = { x: dx, y: -dy }; // -dy because 3D Y is inverted
      }
    };
    
    const handlePointerUp = (e) => {
      if (draggedPieceRef.current) {
        const piece = draggedPieceRef.current;
        const duration = Date.now() - piece.userData.clickTime;
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // If clicked quickly without much movement, add spin!
        if (duration < 250 && dist < 10) {
          piece.userData.spinVel = (piece.userData.spinVel || 0) + Math.PI * 12;
        }
        
        piece.userData.isDragging = false;
        piece.userData.dragOffset = { x: 0, y: 0 };
        draggedPieceRef.current = null;
        document.body.style.cursor = 'default';
      }
    };
    
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  const handlePointerDown = (e) => {
    if (isActivating) return;
    const piece = e.object;
    if (piece.isMesh && !piece.userData.isAnimating) {
      e.stopPropagation(); // Prevent PresentationControls from taking over
      draggedPieceRef.current = piece;
      piece.userData.isDragging = true;
      piece.userData.clickTime = Date.now();
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      document.body.style.cursor = 'grabbing';
    }
  };

  // Handle Intro Animation or animateOnMount
  useEffect(() => {
    if (introCompleted && !animateOnMount) return;
    
    // Spread pieces randomly at the start from far away
    pieces.forEach((piece) => {
      piece.position.set(
        piece.userData.initPos.x + (Math.random() - 0.5) * 30,
        piece.userData.initPos.y + (Math.random() - 0.5) * 30,
        piece.userData.initPos.z + (Math.random() - 0.5) * 30
      );
      piece.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      piece.userData.isAnimating = true;
    });

    // Animate back to original
    const tl = gsap.timeline({
      onComplete: () => {
        pieces.forEach(p => p.userData.isAnimating = false);
        if (!animateOnMount) setIntroCompleted(true);
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

    // If it wasn't already scattered by scatterIdle, scatter it now
    if (!scatterIdle) {
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
        piece.userData.isAnimating = true;
      });
    }

    // Animate back to original forcefully
    const tl = gsap.timeline({
      onComplete: () => {
        pieces.forEach(p => p.userData.isAnimating = false);
      }
    });

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
  }, [isActivating, pieces, scatterIdle]);

  // Main Render Loop (60FPS)
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Resolve section config (if inline, prefer currentSection if explicit, else fallback to inline)
    const targetConfig = (inline && currentSection) ? (SECTION_CONFIGS[currentSection] || SECTION_CONFIGS.inline) : (SECTION_CONFIGS[currentSection] || SECTION_CONFIGS.hero);
    
    const dt = 1.0 - Math.exp(-8 * delta); // Frame-independent lerp factor (faster for snappier feel)
    
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
        // Stop useFrame from fighting GSAP during entrance or activation animations
        if (child.userData.isAnimating) return;

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

        // Drag offset
        const dragX = child.userData.dragOffset ? child.userData.dragOffset.x : 0;
        const dragY = child.userData.dragOffset ? child.userData.dragOffset.y : 0;

        // Move to target (without globalMouse parallax on pieces, to prevent colliding components)
        const targetX = (scatterIdle && !isActivating ? child.userData.scatterPos.x : child.userData.initPos.x) + spreadX + dragX;
        const targetY = (scatterIdle && !isActivating ? child.userData.scatterPos.y : child.userData.initPos.y) + spreadY + breathY + dragY;
        const targetZ = (scatterIdle && !isActivating ? child.userData.scatterPos.z : child.userData.initPos.z) + spreadZ;
        
        const targetRotX = scatterIdle && !isActivating ? child.userData.scatterRot.x : child.userData.initRot.x;
        const targetRotY = scatterIdle && !isActivating ? child.userData.scatterRot.y : child.userData.initRot.y;
        
        // If piece has spin velocity from being clicked, spin it!
        if (child.userData.spinVel) {
           child.rotation.y += child.userData.spinVel * delta;
           child.userData.spinVel *= 0.95; // Dampen spin
           if (Math.abs(child.userData.spinVel) < 0.01) child.userData.spinVel = 0;
           
           child.rotation.x += (targetRotX - child.rotation.x) * dt * 2;
        } else {
           child.rotation.x += (targetRotX - child.rotation.x) * dt * 2;
           child.rotation.y += (targetRotY - child.rotation.y) * dt * 2;
        }

        child.position.x += (targetX - child.position.x) * dt * (child.userData.isDragging ? 10 : 2);
        child.position.y += (targetY - child.position.y) * dt * (child.userData.isDragging ? 10 : 2);
        child.position.z += (targetZ - child.position.z) * dt * 2;
      }
    });
  });

  return (
    <PresentationControls
      global={false} // Allows dragging the background to rotate
      cursor={true}
      snap={true} // Snaps back to original rotation when released
      speed={1.5}
      zoom={1}
      polar={[-Math.PI / 4, Math.PI / 4]} // Limit vertical rotation
      azimuth={[-Math.PI / 2, Math.PI / 2]} // Limit horizontal rotation
    >
      <group ref={groupRef} scale={[3.5, 3.5, 3.5]}>
        <primitive 
          object={scene} 
          onPointerDown={handlePointerDown}
          onPointerOver={(e) => {
            if (!isActivating && e.object.isMesh && !e.object.userData.isAnimating) {
              document.body.style.cursor = 'pointer';
            }
          }}
          onPointerOut={() => {
            if (!draggedPieceRef.current) document.body.style.cursor = 'default';
          }}
        />
        {/* Add particles matching the intro */}
        <Sparkles count={400} scale={20} size={5} speed={0.2} opacity={0.3} color="#ffaa55" />
      </group>
    </PresentationControls>
  );
}

function MouseCameraParallax({ inline }) {
  const { camera } = useThree();
  const currentSection = use3DStore((state) => state.currentSection);
  const activePhilosophyIndex = use3DStore((state) => state.activePhilosophyIndex);
  
  useFrame((state, delta) => {
    // Determine target camera position
    // If inline, reduce parallax
    let targetX = inline ? globalMouse.x * 0.5 : globalMouse.x * 1.5;
    let targetY = inline ? globalMouse.y * 0.5 : globalMouse.y * 1.5;
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

export default function Hero3DModel({ forceVisible, scatterIdle, inline, animateOnMount }) {
  const introCompleted = use3DStore((state) => state.introCompleted);
  const isVisible = forceVisible || introCompleted || animateOnMount;

  return (
    <div style={inline ? { width: '100%', height: '100%', position: 'relative', pointerEvents: 'none', touchAction: 'auto' } : { position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      {/* Optional: Intro Overlay Fade */}
      {!isVisible && (
         <div style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 10, pointerEvents: 'none', transition: 'opacity 2s', opacity: isVisible ? 0 : 1 }} />
      )}
      
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 45 }}
        shadows={!inline}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
        style={{ touchAction: 'auto' }}
      >
        <MouseCameraParallax inline={inline} />
        
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

        <Model url="/models/da-5101.glb" scatterIdle={scatterIdle} inline={inline} animateOnMount={animateOnMount} />
        
        <Preload all />
      </Canvas>
    </div>
  );
}
