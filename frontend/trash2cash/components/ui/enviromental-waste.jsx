// components/ui/enviromental-waste.jsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import animationData from "../animations/environmental_waste.json";

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  { ssr: false }
);

export default function EnvWaste() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="w-[300px] h-[300px] mx-auto mb-1">
      <Player
        autoplay
        loop
        src={animationData}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}
