"use client";

import { useState } from "react";
import LensingCanvas from "@/components/lensing-canvas";
import Controls from "@/components/controls";

export type SimulationParameters = {
  mass: number;
  showAccretionDisk: boolean;
};

export default function ChronoLens() {
  const [params, setParams] = useState<SimulationParameters>({
    mass: 50,
    showAccretionDisk: true,
  });

  const [cameraControls, setCameraControls] = useState<{ reset: () => void } | null>(null);

  const handleReset = () => {
    setParams({ mass: 50, showAccretionDisk: true });
    if (cameraControls) {
      cameraControls.reset();
    }
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background">
      <LensingCanvas
        parameters={params}
        setCameraControls={setCameraControls}
      />
      <Controls
        parameters={params}
        onParameterChange={setParams}
        onReset={handleReset}
      />
    </main>
  );
}
