'use server';
/**
 * @fileOverview An AI flow to parse warehouse update text and return structured data.
 *
 * - updateWarehouses - A function that handles parsing warehouse status text.
 */

import { ai } from '@/ai/genkit';
import { WarehouseUpdateInputSchema, WarehouseUpdateOutputSchema, type WarehouseUpdateInput, type WarehouseUpdateOutput } from '@/ai/schemas';

export async function updateWarehouses(input: WarehouseUpdateInput): Promise<WarehouseUpdateOutput> {
  return updateWarehousesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'updateWarehousesPrompt',
  input: { schema: WarehouseUpdateInputSchema },
  output: { schema: WarehouseUpdateOutputSchema },
  prompt: `You are a data entry specialist for a logistics company. Your task is to parse unstructured text containing updates about warehouse statuses and convert it into a structured JSON format.

The user will provide a text blob. Extract all information for each warehouse mentioned.
Pay close attention to the warehouse name, its total capacity, and the details for each bin, including the bin ID, commodity type, tonnage, and associated code.

The output must be an array of warehouse objects.

Here is the user's text:
{{{prompt}}}
`,
});

const updateWarehousesFlow = ai.defineFlow(
  {
    name: 'updateWarehousesFlow',
    inputSchema: WarehouseUpdateInputSchema,
    outputSchema: WarehouseUpdateOutputSchema,
  },
  async (promptText) => {
    const { output } = await prompt(promptText);
    return output!;
  }
);
