import type { SimulationParameters } from "@/components/chrono-lens";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

type ControlsProps = {
  parameters: SimulationParameters;
  onParameterChange: (newParams: SimulationParameters) => void;
  onReset: () => void;
};

export default function Controls({
  parameters,
  onParameterChange,
  onReset,
}: ControlsProps) {
  const handleMassChange = (value: number[]) => {
    onParameterChange({ ...parameters, mass: value[0] });
  };

  const handleAccretionDiskToggle = (checked: boolean) => {
    onParameterChange({ ...parameters, showAccretionDisk: checked });
  };

  return (
    <div className="absolute top-4 left-4 z-10">
      <Card className="w-80 bg-white/30 backdrop-blur-md border-white/40">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="font-headline text-2xl">Gravity Lensing</CardTitle>
          <Button variant="ghost" size="icon" onClick={onReset} aria-label="Reset view">
            <RotateCcw className="h-5 w-5 text-primary" />
          </Button>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="mass" className="text-base">Black Hole Mass</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="mass"
                min={1}
                max={200}
                step={1}
                value={[parameters.mass]}
                onValueChange={handleMassChange}
              />
              <span className="text-sm font-mono w-12 text-center text-primary">{parameters.mass}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="accretion-disk" className="text-base">Accretion Disk</Label>
            <Switch
              id="accretion-disk"
              checked={parameters.showAccretionDisk}
              onCheckedChange={handleAccretionDiskToggle}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
