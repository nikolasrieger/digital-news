import { CameraControls, Environment } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { Avatar } from "./Avatar";

//apartment, city, dawn, forest, lobby, night, park, studio, sunset, warehouse
export const Scenario = () => {
  const cameraControls = useRef();
  useEffect(() => {
    cameraControls.current.setLookAt(-0.3, 1, 5, -0.3, 1, 0, true);
  }, []);
  return (
    <>
      <CameraControls ref={cameraControls} />
      <Environment preset="apartment" background/> 
      <Avatar />
    </>
  );
};  