"use client"
import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { Html, useProgress } from "@react-three/drei";

// Loader component
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-gray-700 bg-white p-4 rounded-lg shadow-md">Loading model... 
        {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

type ModelProps = {
  url: string;
};

// Model component
function Model({ url }: ModelProps) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

type ThreeSceneProps = {
  url: string;
};

// Main ThreeScene
export default function ThreeScene({ url }: ThreeSceneProps) {
  const [refresh,setRefresh] = useState(false); 
  if (url === "") {
    return <div className="text-black">No Preview Available</div>;
  }
  return (
    <>    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 2]} intensity={1} />

      <Suspense fallback={<Loader />}>
        <Model url={url} />
        <Environment preset="sunset" />
      </Suspense>
      <OrbitControls enableZoom={true} />
    </Canvas>
    </>

  );
}
