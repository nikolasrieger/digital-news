import { Canvas } from "@react-three/fiber";
import { Scenario } from "./components/Scenario";

function App() {
  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 0, 0], fov: 10 }}
        style={{ height: "100vh", width: "100vw" }} 
      >
        <Scenario />
      </Canvas>
    </>
  );
}

export default App;
