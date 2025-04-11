import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import { Box, Sphere, Stats } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
//import { useThree } from '@react-three/fiber';
//import * as THREE from 'three';
import { useRef, useState } from 'react';
import { Joystick } from 'react-joystick-component';


//import { RigidBody} from '@dimforge/rapier3dcompat'; //- could not get from this or compat
import RAPIER from '@dimforge/rapier3d-compat';

import { ActiveCollisionTypes } from '@dimforge/rapier3d-compat';

const activeCollisionTypes =
  ActiveCollisionTypes.DEFAULT | ActiveCollisionTypes.KINEMATIC_FIXED;

const Ball = () => {
  const rb = useRef<RAPIER.RigidBody>(null);
  const [color, setColor] = useState('blue');

  useFrame(({ clock: { elapsedTime } }) => {
    if (!rb.current) return;
    rb.current.setTranslation(
      { x: Math.sin(elapsedTime) * 3, y: 0, z: 0 },
      true
    );
  });

  return (
    <RigidBody
      ref={rb}
      colliders="ball"
      type="kinematicPosition"
      activeCollisionTypes={activeCollisionTypes}
      onCollisionEnter={() => setColor('green')}
      onCollisionExit={() => setColor('blue')}
    >
      <Sphere>
        <meshStandardMaterial color={color} />
      </Sphere>
    </RigidBody>
  );
};

const Wall = () => (
  <RigidBody type="fixed" colliders="cuboid">
    <Box args={[0.5, 5, 2]}>
      <meshStandardMaterial color="white" transparent opacity={0.5} />
    </Box>
  </RigidBody>
);

function App() {
  // Debug state and joystick value states
  const [debug, setDebug] = useState(false);
  const [leftJoystick, setLeftJoystick] = useState({ x: 0, y: 0 });
  const [rightJoystick, setRightJoystick] = useState({ x: 0, y: 0 });

  const handleLeftMove = (event: { x: number | null; y: number | null }) => {
      setLeftJoystick({ x: event.x ?? 0, y: event.y ?? 0 });
    };
  
  const handleRightMove = (event: { x: number | null; y: number | null }) => {
      setRightJoystick({ x: event.x ?? 0, y: event.y ?? 0 });
    };

  const toggleDebug = () => {
    setDebug(prev => !prev);
  };

  return (
    <div style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
      <Canvas
        style={{ width: '100%', height: '100%', background: 'white' }}
        camera={{ position: [0, 0, 5], fov: 75, near: 0.1, far: 1000 }}
      >
        <Stats /> {/* This adds the frame rate counter in the top left */}
        <ambientLight />
        <Physics>
          <Ball />
          <Wall />
        </Physics>
      </Canvas>
      {/* New control panel at bottom center */}
      <div 
        style={{ 
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          textAlign: 'center'
        }}
      >
        <button 
          onClick={toggleDebug} 
          style={{ 
            padding: '5px 10px',
            fontSize: '12px',
            borderRadius: '5px',
            background: 'rgba(173,216,230,0.5)',
            border: 'none',
            marginBottom: '10px',
            cursor: 'pointer'
          }}
        >
          {debug ? 'Disable' : 'Enable'} Debug
        </button>
        {debug && (
          <div 
            style={{ 
              backgroundColor: 'rgba(173,216,230,0.2)', 
              padding: '5px 10px',
              borderRadius: '4px',
              marginBottom: '10px',
              color: '#333' 
            }}
          >
            <div>
              <strong>Left Joystick:</strong> x: {leftJoystick.x.toFixed(1)}, y: {leftJoystick.y.toFixed(1)}
            </div>
            <div>
              <strong>Right Joystick:</strong> x: {rightJoystick.x.toFixed(1)}, y: {rightJoystick.y.toFixed(1)}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <Joystick
            size={100}
            sticky={false}
            baseColor="lightgray"
            stickColor="blue"
            move={handleLeftMove}
            stop={() => setLeftJoystick({ x: 0, y: 0 })}
          />
          <Joystick
            size={100}
            sticky={false}
            baseColor="lightgray"
            stickColor="blue"
            move={handleRightMove}
            stop={() => setRightJoystick({ x: 0, y: 0 })}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

