'use server';
/**
 * @fileOverview An AI flow to parse warehouse update text and return structured data.
 *
 * - updateWarehouses - A function that handles parsing warehouse status text.
 * - WarehouseUpdateInput - The input type for the flow (string).
 * - WarehouseUpdateOutput - The output type for the flow (array of warehouse objects).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WarehouseBinSchema = z.object({
  id: z.string().describe('The identifier for the bin, e.g., "9A", "7B".'),
  commodity: z.string().describe('The type of commodity in the bin, e.g., "Corn", "Barley".'),
  tonnage: z.number().describe('The amount of commodity in the bin, measured in tons.'),
  code: z.string().describe('The code associated with the commodity in the bin, e.g., "AFRA".'),
});

const WarehouseSchema = z.object({
  id: z.number().describe('The numeric ID of the warehouse, e.g., 9, 7.'),
  name: z.string().describe('The name of the warehouse, e.g., "Warehouse 9".'),
  totalCapacity: z.number().describe('The total storage capacity of the warehouse in tons.'),
  bins: z.array(WarehouseBinSchema).describe('A list of bins within the warehouse.'),
});

export const WarehouseUpdateInputSchema = z.string();
export type WarehouseUpdateInput = z.infer<typeof WarehouseUpdateInputSchema>;

export const WarehouseUpdateOutputSchema = z.array(WarehouseSchema);
export type WarehouseUpdateOutput = z.infer<typeof WarehouseUpdateOutputSchema>;

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
