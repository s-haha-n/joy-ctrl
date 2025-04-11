import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import { Box, Sphere, Stats } from '@react-three/drei';
import { useRef, useState } from 'react';
import { Joystick } from 'react-joystick-component';
import RAPIER from '@dimforge/rapier3d-compat';
import { ActiveCollisionTypes } from '@dimforge/rapier3d-compat';

const globalStyles = `
  html, body, #root {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    touch-action: none; /* Prevents pinch zoom and drag scroll */
  }

  canvas {
    display: block;
  }
`;

const styleTag = document.createElement('style');
styleTag.innerHTML = globalStyles;
document.head.appendChild(styleTag);

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

const CameraController = ({ leftJoystick, rightJoystick }: { leftJoystick: { x: number; y: number }; rightJoystick: { x: number; y: number } }) => {
  const { camera } = useThree();
  const cameraRotationSpeed = 0.05;
  const cameraMovementSpeed = 0.1;

  useFrame(() => {
    // Update camera position based on left joystick
    camera.position.x += leftJoystick.x * cameraMovementSpeed;
    camera.position.z -= leftJoystick.y * cameraMovementSpeed;

    // Update camera rotation based on right joystick
    camera.rotation.y -= rightJoystick.x * cameraRotationSpeed; // Invert horizontal rotation
    camera.rotation.x = Math.max(
      Math.min(camera.rotation.x + rightJoystick.y * cameraRotationSpeed, Math.PI / 2), // Invert vertical rotation
      -Math.PI / 2
    );
  });

  return null;
};

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
    <div style={{ fontFamily: 'Arial, sans-serif', height: '100vh' }}>
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
        <CameraController leftJoystick={leftJoystick} rightJoystick={rightJoystick} />
      </Canvas>

      {/* New control panel at bottom center */}
      <div 
        style={{ 
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          textAlign: 'left'
        }}
      >
        
        {debug && (
          <div
            style={{
              backgroundColor: 'rgba(54, 193, 240, 0.1)',
              padding: '5px 10px',
              borderRadius: '4px',
              marginBottom: '10px',
              color: 'rgba(252, 28, 132, 0.55)',
              fontSize: '12px',    
              alignContent: 'left'
            }}
          >
            <div>
              <strong>LEFT JOYSTICK:</strong> &nbsp; X: {leftJoystick.x.toFixed(1)}, Y: {leftJoystick.y.toFixed(1)}
            </div>
            <div>
              <strong>RIGHT JOYSTICK:</strong> X: {rightJoystick.x.toFixed(1)}, Y: {rightJoystick.y.toFixed(1)}
            </div>
          </div>
        )}
        <button 
          onClick={toggleDebug} 
          style={{ 
            padding: '5px 10px',
            fontSize: '12px',
            borderRadius: '5px',
            backgroundColor: 'rgba(54, 193, 240, 0.1)',
            color: 'rgba(252, 28, 132, 0.55)',
            border: 'none',
            marginBottom: '10px',
            cursor: 'pointer'
          }}
        >
          {debug ? 'Disable' : 'Enable'} Debug
        </button>
        
        <div style={{ display: 'flex', gap: '40px', justifyContent: 'center' }}>
          <Joystick
            size={100}
            sticky={false}
            baseColor="rgba(133, 133, 133, 0.49)"
            stickColor="rgba(255, 255, 255, 0.49)"
            move={handleLeftMove}
            stop={() => setLeftJoystick({ x: 0, y: 0 })}
          />
          <Joystick
            size={100}
            sticky={false}
            baseColor="rgba(122, 122, 122, 0.49)"
            stickColor="rgba(255, 255, 255, 0.49)"
            move={handleRightMove}
            stop={() => setRightJoystick({ x: 0, y: 0 })}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

