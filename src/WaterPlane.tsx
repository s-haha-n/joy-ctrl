// components/WaterPlane.tsx
import { useRef, useEffect } from 'react';
import { useLoader, extend, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water.js';

extend({ Water });

const WaterPlane = () => {
  const waterRef = useRef<THREE.Mesh>(null);
  const waterNormals = useLoader(THREE.TextureLoader, '/joy-ctrl/textures/waternormals.jpg'); // Ensure the path is correct

  // Adjust texture wrapping and repeating
  waterNormals.wrapS = THREE.RepeatWrapping;
  waterNormals.wrapT = THREE.RepeatWrapping;
  waterNormals.repeat.set(50, 50); // Adjust the repeat values as needed

  useEffect(() => {
    if (waterRef.current) {
      const water = new Water(new THREE.PlaneGeometry(10000, 10000), {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: waterNormals,
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x026d78,
        distortionScale: 30.7,
        fog: false,
      });

      waterRef.current.add(water);
      waterRef.current.userData.water = water; // Store the water instance for later use
    }
  }, [waterNormals]);

  // Update the water's time uniform on every frame
  useFrame(() => {
    if (waterRef.current?.userData.water) {
      const water = waterRef.current.userData.water;
      water.material.uniforms['time'].value += 1.0 / 60.0; // Increment time for animation
    }
  });

  return (
    <mesh ref={waterRef} position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[10000, 10000]} />
    </mesh>
  );
};

export default WaterPlane;
