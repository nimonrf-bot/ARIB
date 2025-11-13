'use server';
/**
 * @fileOverview An AI flow to parse vessel update text and return structured data.
 *
 * - updateVessels - A function that handles parsing vessel status text.
 */

import { ai } from '@/ai/genkit';
import { VesselUpdateInputSchema, VesselUpdateOutputSchema, type VesselUpdateInput, type VesselUpdateOutput } from '@/ai/schemas';

export async function updateVessels(input: VesselUpdateInput): Promise<VesselUpdateOutput> {
  return updateVesselsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'updateVesselsPrompt',
  input: { schema: VesselUpdateInputSchema },
  output: { schema: VesselUpdateOutputSchema },
  prompt: `You are a data entry specialist for a shipping logistics company. Your task is to parse unstructured text containing updates about vessel statuses and convert it into a structured JSON format.

The user will provide a text blob. Extract all information for each vessel mentioned.
Pay close attention to the vessel name, its cargo, origin port, destination port, and its current status.

The output must be an array of vessel objects.

Here is the user's text:
{{{prompt}}}
`,
});

const updateVesselsFlow = ai.defineFlow(
  {
    name: 'updateVesselsFlow',
    inputSchema: VesselUpdateInputSchema,
    outputSchema: VesselUpdateOutputSchema,
  },
  async (promptText) => {
    const { output } = await prompt(promptText);
    return output!;
  }
);
