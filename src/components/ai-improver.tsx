"use client";

import { useState } from "react";
import { improveRayTracingInstructions, type ImproveRayTracingInstructionsInput } from "@/ai/flows/improve-ray-tracing-instructions";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wand2 } from "lucide-react";

const defaultInstructions = `
// Ray tracing through a gravitational field
// 1. For each pixel, cast a ray from the camera.
// 2. Calculate the ray's trajectory as it passes near the black hole.
// 3. The path is bent based on the mass of the black hole.
// 4. Determine the color from the background where the ray terminates.
`.trim();

export default function AiImprover() {
  const [instructions, setInstructions] = useState(defaultInstructions);
  const [rewrittenInstructions, setRewrittenInstructions] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleImproveInstructions = async () => {
    setIsLoading(true);
    setRewrittenInstructions("");
    try {
      const input: ImproveRayTracingInstructionsInput = {
        graphicsLibrary: "Three.js (WebGL)",
        originalInstructions: instructions,
      };
      const result = await improveRayTracingInstructions(input);
      setRewrittenInstructions(result.rewrittenInstructions);
    } catch (error) {
      console.error("Failed to improve instructions:", error);
      setRewrittenInstructions("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-base">AI Instructions Improver</AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div>
            <Label htmlFor="original-instructions">Original Instructions</Label>
            <Textarea
              id="original-instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={8}
              className="mt-2 font-mono text-xs"
            />
          </div>
          <Button onClick={handleImproveInstructions} disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            {isLoading ? "Improving..." : <><Wand2 className="mr-2 h-4 w-4" /> Improve with AI</>}
          </Button>
          {rewrittenInstructions && (
            <div className="mt-4">
              <Label>Rewritten Instructions</Label>
              <div className="mt-2 rounded-md border bg-background/50 p-3">
                <pre className="whitespace-pre-wrap font-mono text-xs text-foreground">
                  {rewrittenInstructions}
                </pre>
              </div>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
