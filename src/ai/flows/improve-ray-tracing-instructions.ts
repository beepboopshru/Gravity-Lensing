'use server';
/**
 * @fileOverview An AI agent that rewrites ray tracing instructions for a 3D graphics library.
 *
 * - improveRayTracingInstructions - A function that rewrites ray tracing instructions based on the selected 3D graphics library.
 * - ImproveRayTracingInstructionsInput - The input type for the improveRayTracingInstructions function.
 * - ImproveRayTracingInstructionsOutput - The return type for the improveRayTracingInstructions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveRayTracingInstructionsInputSchema = z.object({
  graphicsLibrary: z.string().describe('The 3D graphics library to optimize for (e.g., Three.js, Babylon.js).'),
  originalInstructions: z.string().describe('The original ray tracing instructions.'),
});
export type ImproveRayTracingInstructionsInput = z.infer<typeof ImproveRayTracingInstructionsInputSchema>;

const ImproveRayTracingInstructionsOutputSchema = z.object({
  rewrittenInstructions: z.string().describe('The rewritten, optimized ray tracing instructions.'),
});
export type ImproveRayTracingInstructionsOutput = z.infer<typeof ImproveRayTracingInstructionsOutputSchema>;

export async function improveRayTracingInstructions(input: ImproveRayTracingInstructionsInput): Promise<ImproveRayTracingInstructionsOutput> {
  return improveRayTracingInstructionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveRayTracingInstructionsPrompt',
  input: {schema: ImproveRayTracingInstructionsInputSchema},
  output: {schema: ImproveRayTracingInstructionsOutputSchema},
  prompt: `You are an expert in 3D graphics and ray tracing. Your task is to rewrite the given ray tracing instructions to be more precise and performant for the specified 3D graphics library.

Graphics Library: {{{graphicsLibrary}}}
Original Instructions: {{{originalInstructions}}}

Please provide the rewritten instructions:
`,
});

const improveRayTracingInstructionsFlow = ai.defineFlow(
  {
    name: 'improveRayTracingInstructionsFlow',
    inputSchema: ImproveRayTracingInstructionsInputSchema,
    outputSchema: ImproveRayTracingInstructionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
