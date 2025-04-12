import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import { Box, Sphere, Stats } from '@react-three/drei';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Joystick } from 'react-joystick-component';
import RAPIER from '@dimforge/rapier3d-compat';
import { ActiveCollisionTypes } from '@dimforge/rapier3d-compat';
import WaterPlane from './WaterPlane';
import * as THREE from 'three';

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

const Ball = ({ onCollision }: { onCollision: () => void }) => {
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

      onCollisionEnter={() => {
        setColor('green');
        onCollision(); // Increment collision count
      }}
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

const CameraController = ({
  leftJoystick,
  rightJoystick,
}: {
  leftJoystick: { x: number; y: number };
  rightJoystick: { x: number; y: number };
}) => {
  const { camera } = useThree();
  const cameraRotationSpeed = 0.05;
  const cameraMovementSpeed = 0.1;

  useFrame(() => {
    // Calculate the forward and right vectors of the camera
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    camera.getWorldDirection(forward); // Forward vector
    forward.y = 0; // Ignore vertical movement
    forward.normalize();

    right.crossVectors(forward, camera.up); // Right vector
    right.normalize();

    // Calculate movement based on joystick input
    const moveX = leftJoystick.x * cameraMovementSpeed;
    const moveZ = leftJoystick.y * cameraMovementSpeed;

    // Apply movement relative to the camera's orientation
    camera.position.addScaledVector(forward, moveZ); // Forward/backward
    camera.position.addScaledVector(right, moveX);

    // Update camera rotation based on right joystick
    camera.rotation.y -= rightJoystick.x * cameraRotationSpeed;
  });

  return null;
};

const FireButton = ({ onFire }: { onFire: () => void }) => (
  <button
    onClick={(e) => {
      // Prevent click propagation to underlying elements
      e.stopPropagation();
      onFire();
    }}
    style={{
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      border: 'none',
      backgroundColor: 'red',
      color: 'white',
      fontSize: '16px',
      cursor: 'pointer',
      boxShadow: '0 3px 5px rgba(0, 0, 0, 0.3)',
    }}
  >
    FIRE
  </button>
);

// const BulletManager = ({ bullets }: { bullets: React.ReactNode[] }) => {
type BulletManagerHandle = {
  fire: () => void;
};

const BulletManager = forwardRef<BulletManagerHandle>((_, ref) => {
  const { camera } = useThree();
  const [bullets, setBullets] = useState<React.ReactNode[]>([]);
  const [canFire, setCanFire] = useState(true);

  const Bullet = ({ position, velocity }: { position: THREE.Vector3Tuple; velocity: THREE.Vector3Tuple }) => {
    return (
      <RigidBody
        colliders="ball"
        type="dynamic"
        position={position}
        linearVelocity={velocity}
      >
        <Sphere args={[0.1]}>
          <meshStandardMaterial color="red" />
        </Sphere>
      </RigidBody>
    );
  };

  const handleFire = () => {
    if (!canFire) return;

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward).normalize();

    const bulletPosition = camera.position
      .clone()
      .add(forward.clone().multiplyScalar(1));
    const bulletVelocity = forward.clone().multiplyScalar(35);

    const bullet = (
      <Bullet
        key={Date.now()}
        position={[bulletPosition.x, bulletPosition.y, bulletPosition.z]}
        velocity={[bulletVelocity.x, bulletVelocity.y, bulletVelocity.z]}
      />
    );

    setBullets((prevBullets) => [...prevBullets, bullet]);
    setCanFire(false);

    setTimeout(() => {
      setCanFire(true);
    }, 300);
  };

  // 👇 Expose fire function to parent
  useImperativeHandle(ref, () => ({
    fire: handleFire,
  }));

  return <>{bullets}</>;
});

function App() {
  // Debug state and joystick value states
  const [debug, setDebug] = useState(false);
  const [leftJoystick, setLeftJoystick] = useState({ x: 0, y: 0 });
  const [rightJoystick, setRightJoystick] = useState({ x: 0, y: 0 });
  const [collisionCount, setCollisionCount] = useState(0); // Track collision count

  const bulletManagerRef = useRef<BulletManagerHandle>(null);

  const handleFire = () => {
    bulletManagerRef.current?.fire();
  };


  const handleLeftMove = (event: { x: number | null; y: number | null }) => {
    setLeftJoystick({ x: event.x ?? 0, y: event.y ?? 0 });
  };

  const handleRightMove = (event: { x: number | null; y: number | null }) => {
    setRightJoystick({ x: event.x ?? 0, y: event.y ?? 0 });
  };

  const toggleDebug = () => {
    setDebug((prev) => !prev);
  };

  const incrementCollisionCount = () => {
    setCollisionCount((prev) => prev + 1);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', height: '100vh' }}>
      <Canvas
        style={{ width: '100%', height: '100%', background: 'white' }}
        camera={{ position: [0, 0, 5], fov: 75, near: 0.1, far: 1000 }}
      >
        <Stats />
        <ambientLight />
        <WaterPlane />
        <Physics>
          <Ball onCollision={incrementCollisionCount} />
          <Wall />
          <BulletManager ref={bulletManagerRef} />
        </Physics>
        <CameraController leftJoystick={leftJoystick} rightJoystick={rightJoystick} />
      </Canvas>

      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          pointerEvents: 'auto', // Ensures UI elements receive pointer events
          textAlign: 'center',
        }}
      >
        {debug && (
          <div
            id="debug-info"
            className="debug"
            style={{
              backgroundColor: 'rgba(54, 193, 240, 0.1)',
              padding: '5px 10px',
              borderRadius: '4px',
              marginBottom: '10px',
              color: 'rgba(255, 56, 149, 0.75)',
              fontSize: '12px',
              textAlign: 'left',
            }}
          >
            <div>
              <strong>LEFT JOYSTICK:</strong> &nbsp; X: {leftJoystick.x.toFixed(1)}, Y:{' '}
              {leftJoystick.y.toFixed(1)}
            </div>
            <div>
              <strong>RIGHT JOYSTICK:</strong> X: {rightJoystick.x.toFixed(1)}, Y:{' '}
              {rightJoystick.y.toFixed(1)}
            </div>
            <br></br>
            <FireButton onFire={handleFire} />
            <br></br>
            <br></br>
            <div>
              <strong>COLLISION COUNT:</strong> {collisionCount}
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
            color: 'rgba(255, 56, 149, 0.75)',
            border: 'none',
            marginBottom: '20px',
            cursor: 'pointer',
          }}
        >
          {debug ? 'Disable' : 'Enable'} Debug
        </button>

        <div
          style={{
            display: 'flex',
            gap: '120px',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          <Joystick
            size={100}
            sticky={false}
            baseColor="rgba(133, 133, 133, 0.29)"
            stickColor="rgba(255, 255, 255, 0.19)"
            throttle={100} // Throttle move events to every 100ms
            move={handleLeftMove}
            stop={() => setLeftJoystick({ x: 0, y: 0 })}
          />
          <Joystick
            size={100}
            sticky={false}
            baseColor="rgba(122, 122, 122, 0.29)"
            stickColor="rgba(255, 255, 255, 0.19)"
            throttle={100} // Throttle move events to every 100ms
            move={handleRightMove}
            stop={() => setRightJoystick({ x: 0, y: 0 })}
          />
        </div>

      </div>
    </div>
  );
}

export default App;
