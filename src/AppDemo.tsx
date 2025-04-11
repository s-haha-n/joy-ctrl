import { Box, Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
//import { Perf } from "r3f-perf";
import {
  JSX,
  ReactNode,
  StrictMode,
  Suspense,
  createContext,
  useContext,
  useRef,
  useState
} from "react";

import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
//import { useResetOrbitControls } from "./hooks/use-reset-orbit-controls";

type AppDemo = {
  setDebug: (f: boolean) => void;
  setPaused: (f: boolean) => void;
  setCameraEnabled: (f: boolean) => void;
  orbitControlRef: React.RefObject<OrbitControlsImpl>;
};

const demoContext = createContext<Partial<AppDemo>>({});

export const useDemo = () => useContext(demoContext);

export interface Demo {
  (props: { children?: ReactNode }): JSX.Element;
}

const Floor = () => {
  return (
    <RigidBody type="fixed" colliders="cuboid" name="floor">
      <Box
        position={[0, -12.55 - 5, 0]}
        scale={[200, 10, 200]}
        rotation={[0, 0, 0]}
        receiveShadow
      >
        <shadowMaterial opacity={0.2} />
      </Box>
    </RigidBody>
  );
};

export const AppDemo = () => {
  const [debug, setDebug] = useState<boolean>(false);
  const [perf, setPerf] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);
  const [interpolate, setInterpolate] = useState<boolean>(true);
  const [physicsKey, setPhysicsKey] = useState<number>(0);
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);
  const orbitControlRef = useRef<OrbitControlsImpl>(null!);

  //useResetOrbitControls();

  const updatePhysicsKey = () => {
    setPhysicsKey((current) => current + 1);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "linear-gradient(#aef, #ddd)",
        backgroundRepeat: "repeat",
        fontFamily: "sans-serif"
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          // background: "radial-gradient(#00000035 1px, transparent 0px)",
          backgroundSize: "24px 24px",
          backgroundRepeat: "repeat"
        }}
      />
      <Suspense fallback="Loading...">
        <Canvas shadows dpr={1}>
          <StrictMode>
            <Physics
              paused={paused}
              key={physicsKey}
              interpolate={interpolate}
              debug={debug}
              timeStep={1 / 60}
            >
              <directionalLight
                castShadow
                position={[10, 10, 10]}
                shadow-camera-bottom={-40}
                shadow-camera-top={40}
                shadow-camera-left={-40}
                shadow-camera-right={40}
                shadow-mapSize-width={1024}
                shadow-bias={-0.0001}
              />
              <Environment preset="apartment" />

              <OrbitControls ref={orbitControlRef} enabled={cameraEnabled} />

              <demoContext.Provider
                value={{
                  setDebug,
                  setPaused,
                  setCameraEnabled,
                  orbitControlRef
                }}
              >
             </demoContext.Provider>

              <Floor />

            </Physics>
          </StrictMode>
        </Canvas>
      </Suspense>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 240,
          display: "block",
          flexWrap: "wrap",
          overflow: "auto",
          padding: 20,
          background: "linear-gradient(to right, #fffa, #fffa)"
        }}
      >
        <h1
          style={{
            fontSize: 24
          }}
        >
          r3/rapier demos
        </h1>

        <div>
          <ToggleButton
            label="Debug"
            value={debug}
            onClick={() => setDebug((v) => !v)}
          />
          <ToggleButton
            label="Perf"
            value={perf}
            onClick={() => setPerf((v) => !v)}
          />
          <ToggleButton
            label="Paused"
            value={paused}
            onClick={() => setPaused((v) => !v)}
          />
          <ToggleButton
            label="Interpolate"
            value={interpolate}
            onClick={() => setInterpolate((v) => !v)}
          />
          <ToggleButton
            label="Reset"
            value={false}
            onClick={updatePhysicsKey}
          />
        </div>

      </div>
    </div>
  );
};


const ToggleButton = ({
  label,
  value,
  onClick
}: {
  label: string;
  value: boolean;
  onClick(): void;
}) => (
  <button
    style={{
      background: value ? "red" : "transparent",
      border: "2px solid red",
      color: value ? "white" : "red",
      borderRadius: 4,
      margin: 4
    }}
    onClick={onClick}
  >
    {label}
  </button>
);

export default AppDemo;