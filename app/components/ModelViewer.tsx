"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, Gltf } from "@react-three/drei";
import { Suspense } from "react";

function Model({ url }: { url: string }) {
  return <Gltf src={url} castShadow receiveShadow />;
}

export default function ModelViewer({ url }: { url: string }) {
  if (url === "#" || !url) return <div style={{ width: "100%", height: "200px", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#444" }}>PREVIEW UNAVAILABLE</div>;
  return (
    <div style={{ width: "100%", height: "200px", background: "#000", borderRadius: "4px", overflow: "hidden" }}>
      <Suspense fallback={<div style={{ color: "white", padding: "20px" }}>SCANNING...</div>}>
        <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
          <Stage environment="city" intensity={0.5}><Model url={url} /></Stage>
          <OrbitControls makeDefault />
        </Canvas>
      </Suspense>
    </div>
  );
}
