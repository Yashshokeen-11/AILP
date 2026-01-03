"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Text, Float } from "@react-three/drei";
import type { Group, Mesh } from "three";

const encouragingMessages = [
  "Great progress! Keep going! 💪",
  "You're doing amazing! 🌟",
  "Take your time, you've got this! 📚",
  "Learning is a journey, enjoy it! 🚀",
  "Every step forward counts! ✨",
  "You're building something great! 🏗️",
];

// Teacher Character Component - Feminine Design
function TeacherCharacter({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Mesh>(null);
  const bodyRef = useRef<Mesh>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const hairRef = useRef<Group>(null);

  // Gentle floating animation with more movement
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
    }
    
    // Gentle head nod
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
    
    // Hair sway
    if (hairRef.current) {
      hairRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.6) * 0.1;
    }
    
    // Gentle arm movement (teaching gesture)
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.3 - 0.4;
      leftArmRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.6) * 0.1;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8 + 1) * 0.3 - 0.4;
      rightArmRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.6 + 1) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[2.0, 2.0, 2.0]}>
      {/* Torso - Slender build */}
      <mesh ref={bodyRef} position={[0, -0.2, 0]}>
        <boxGeometry args={[0.6, 1.2, 0.4]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>

      {/* White Crop Top */}
      <mesh position={[0, 0.3, 0.22]}>
        <boxGeometry args={[0.65, 0.6, 0.25]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>

      {/* Midriff - Exposed */}
      <mesh position={[0, -0.1, 0.22]}>
        <boxGeometry args={[0.55, 0.3, 0.22]} />
        <meshStandardMaterial color="#FFE5D9" roughness={0.4} />
      </mesh>

      {/* Waist - Defined */}
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[0.5, 0.35, 0.35]} />
        <meshStandardMaterial color="#FFE5D9" roughness={0.4} />
      </mesh>

      {/* Hips - Curvy */}
      <mesh position={[0, -0.75, 0]}>
        <boxGeometry args={[0.65, 0.5, 0.45]} />
        <meshStandardMaterial color="#87CEEB" roughness={0.4} />
      </mesh>

      {/* Head - Stylized and attractive */}
      <mesh ref={headRef} position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.52, 32, 32]} />
        <meshStandardMaterial color="#FFE5D9" roughness={0.3} />
      </mesh>

      {/* Voluminous Pink Hair - Bubblegum pink */}
      <group ref={hairRef} position={[0, 0.5, 0]}>
        {/* Hair base - very full */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.8, 0.6, 0.7]} />
          <meshStandardMaterial color="#FF69B4" roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Hair sides - flowing and voluminous */}
        <mesh position={[-0.35, 0.1, 0.2]}>
          <boxGeometry args={[0.2, 1.2, 0.3]} />
          <meshStandardMaterial color="#FF69B4" roughness={0.2} metalness={0.1} />
        </mesh>
        <mesh position={[0.35, 0.1, 0.2]}>
          <boxGeometry args={[0.2, 1.2, 0.3]} />
          <meshStandardMaterial color="#FF69B4" roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Hair back - cascading */}
        <mesh position={[0, -0.05, -0.2]}>
          <boxGeometry args={[0.7, 1.8, 0.5]} />
          <meshStandardMaterial color="#FF69B4" roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Hair highlights - lighter pink */}
        <mesh position={[0, 0.3, 0.25]}>
          <boxGeometry args={[0.6, 0.3, 0.15]} />
          <meshStandardMaterial color="#FFB6E1" roughness={0.1} metalness={0.2} />
        </mesh>
        {/* Hair bangs - framing face */}
        <mesh position={[0, 0.8, 0.3]}>
          <boxGeometry args={[0.6, 0.25, 0.12]} />
          <meshStandardMaterial color="#FF69B4" roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Hair curls at ends */}
        <mesh position={[-0.3, -0.8, 0.15]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#FF69B4" roughness={0.2} metalness={0.1} />
        </mesh>
        <mesh position={[0.3, -0.8, 0.15]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#FF69B4" roughness={0.2} metalness={0.1} />
        </mesh>
      </group>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.45, -0.2, 0]}>
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry args={[0.18, 0.9, 0.18]} />
          <meshStandardMaterial color="#FFDBB3" roughness={0.4} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.95, 0]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color="#FFDBB3" roughness={0.4} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.45, -0.2, 0]}>
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry args={[0.18, 0.9, 0.18]} />
          <meshStandardMaterial color="#FFDBB3" roughness={0.4} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.95, 0]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color="#FFDBB3" roughness={0.4} />
        </mesh>
      </group>

      {/* Light Blue Jeans */}
      <mesh position={[0, -0.9, 0]}>
        <boxGeometry args={[0.7, 0.6, 0.48]} />
        <meshStandardMaterial color="#87CEEB" roughness={0.5} />
      </mesh>

      {/* Belt */}
      <mesh position={[0, -0.6, 0.24]}>
        <boxGeometry args={[0.68, 0.08, 0.05]} />
        <meshStandardMaterial color="#8B4513" roughness={0.3} />
      </mesh>
      {/* Belt buckle */}
      <mesh position={[0, -0.6, 0.26]}>
        <boxGeometry args={[0.12, 0.1, 0.03]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Legs - In jeans */}
      <mesh position={[-0.18, -1.5, 0]}>
        <boxGeometry args={[0.24, 1.0, 0.24]} />
        <meshStandardMaterial color="#87CEEB" roughness={0.5} />
      </mesh>
      <mesh position={[0.18, -1.5, 0]}>
        <boxGeometry args={[0.24, 1.0, 0.24]} />
        <meshStandardMaterial color="#87CEEB" roughness={0.5} />
      </mesh>

      {/* Eyes - Large blue eyes with thick lashes */}
      {/* Eye whites */}
      <mesh position={[-0.16, 0.7, 0.48]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.16, 0.7, 0.48]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Blue irises */}
      <mesh position={[-0.16, 0.7, 0.49]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color="#4169E1" />
      </mesh>
      <mesh position={[0.16, 0.7, 0.49]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color="#4169E1" />
      </mesh>
      
      {/* Pupils */}
      <mesh position={[-0.16, 0.7, 0.5]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.16, 0.7, 0.5]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Eye highlights */}
      <mesh position={[-0.14, 0.72, 0.51]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.18, 0.72, 0.51]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {/* Thick eyeliner */}
      <mesh position={[-0.16, 0.68, 0.47]}>
        <boxGeometry args={[0.25, 0.03, 0.02]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.16, 0.68, 0.47]}>
        <boxGeometry args={[0.25, 0.03, 0.02]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Thick eyelashes */}
      <mesh position={[-0.16, 0.65, 0.47]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.12, 0.04, 0.02]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.16, 0.65, 0.47]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.12, 0.04, 0.02]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Eyebrows - Light brown, arched */}
      <mesh position={[-0.16, 0.82, 0.44]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.22, 0.025, 0.01]} />
        <meshStandardMaterial color="#D4A574" />
      </mesh>
      <mesh position={[0.16, 0.82, 0.44]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.22, 0.025, 0.01]} />
        <meshStandardMaterial color="#D4A574" />
      </mesh>

      {/* Lips - Natural pink/nude, full */}
      <mesh position={[0, 0.5, 0.45]}>
        <boxGeometry args={[0.25, 0.08, 0.03]} />
        <meshStandardMaterial color="#FFB6C1" roughness={0.3} />
      </mesh>
      {/* Lip shine */}
      <mesh position={[0, 0.52, 0.46]}>
        <boxGeometry args={[0.15, 0.04, 0.01]} />
        <meshStandardMaterial color="#FFC0CB" opacity={0.6} transparent />
      </mesh>

      {/* Blush - More prominent */}
      <mesh position={[-0.28, 0.55, 0.4]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#FFB6C1" opacity={0.7} transparent />
      </mesh>
      <mesh position={[0.28, 0.55, 0.4]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#FFB6C1" opacity={0.7} transparent />
      </mesh>

      {/* Nose - More defined */}
      <mesh position={[0, 0.6, 0.43]}>
        <boxGeometry args={[0.06, 0.08, 0.04]} />
        <meshStandardMaterial color="#FFE5D9" roughness={0.3} />
      </mesh>
    </group>
  );
}

// Speech Bubble Component (3D version - optional, we'll use 2D overlay instead)
function SpeechBubble3D({ message }: { message: string }) {
  return (
    <group position={[0, 1.5, 0]}>
      {/* Bubble background */}
      <mesh>
        <boxGeometry args={[2, 0.6, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Text */}
      <Text
        position={[0, 0, 0.1]}
        fontSize={0.12}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
      >
        {message}
      </Text>
    </group>
  );
}

// Main 3D Teacher Component
export function Teacher3D({ className = "" }: { className?: string }) {
  const [currentMessage, setCurrentMessage] = useState(encouragingMessages[0]);

  useEffect(() => {
    // Change message every 5 seconds
    const interval = setInterval(() => {
      setCurrentMessage(
        encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`w-full h-full relative ${className}`}>
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true }}
        className="bg-transparent"
      >
        {/* Enhanced Lighting for better appearance */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        <pointLight position={[0, 5, 5]} intensity={0.6} color="#FFB6C1" />

        {/* Camera - Closer for better view */}
        <PerspectiveCamera makeDefault position={[0, 0.5, 3.5]} fov={55} />

        {/* Teacher Character */}
        <Float speed={1.8} rotationIntensity={0.15} floatIntensity={0.4}>
          <TeacherCharacter position={[0, -0.5, 0]} />
        </Float>

        {/* Ground plane for shadow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.25} />
        </mesh>

        {/* Orbit Controls for interaction */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={2.5}
          maxDistance={5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.1}
          autoRotate
          autoRotateSpeed={0.8}
        />
      </Canvas>
      
      {/* 2D Speech Bubble - Larger and more prominent */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-gradient-to-br from-white to-pink-50 dark:from-card dark:to-pink-950/20 border-2 border-pink-300 dark:border-pink-700 rounded-xl px-6 py-3 shadow-2xl max-w-[240px] backdrop-blur-sm">
        <p className="text-sm text-foreground text-center font-semibold">
          {currentMessage}
        </p>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-white to-pink-50 dark:from-card dark:to-pink-950/20 border-r-2 border-b-2 border-pink-300 dark:border-pink-700 rotate-45"></div>
      </div>
    </div>
  );
}

