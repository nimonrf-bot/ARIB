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
