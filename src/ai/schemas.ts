import { z } from 'genkit';

// Schemas for Warehouses
const WarehouseBinSchema = z.object({
  id: z.string().describe('The identifier for the bin, e.g., "9A", "7B".'),
  commodity: z.string().describe('The type of commodity in the bin, e.g., "Corn", "Barley".'),
  tonnage: z.number().describe('The amount of commodity in the bin, measured in tons.'),
  code: z.string().describe('The code associated with the commodity in the bin, e.g., "AFRA".'),
});

const WarehouseSchema = z.object({
  id: z.number().optional().describe('The numeric ID of the warehouse, e.g., 9, 7.'),
  name: z.string().describe('The name of the warehouse, e.g., "Warehouse 9".'),
  totalCapacity: z.number().optional().describe('The total storage capacity of the warehouse in tons.'),
  bins: z.array(WarehouseBinSchema).describe('A list of bins within the warehouse.'),
});

export const WarehouseUpdateInputSchema = z.string();
export type WarehouseUpdateInput = z.infer<typeof WarehouseUpdateInputSchema>;

export const WarehouseUpdateOutputSchema = z.array(WarehouseSchema);
export type WarehouseUpdateOutput = z.infer<typeof WarehouseUpdateOutputSchema>;


// Schemas for Vessels
const VesselSchema = z.object({
  vesselName: z.string().describe("The name of the vessel, e.g., 'Omskiy-130'."),
  cargo: z.string().optional().describe('The cargo the vessel is carrying.'),
  status: z.string().optional().describe('The current status of the vessel.'),
  origin: z.string().optional().describe('The port of origin.'),
  destination: z.string().optional().describe('The port of destination.'),
  departureDate: z.string().optional().describe('The departure date in YYYY-MM-DD format.'),
  etaDate: z.string().optional().describe('The estimated time of arrival date in YYYY-MM-DD format.'),
  anchored: z.boolean().optional().describe('Whether the vessel is currently anchored.'),
});

export const VesselUpdateInputSchema = z.string();
export type VesselUpdateInput = z.infer<typeof VesselUpdateInputSchema>;

export const VesselUpdateOutputSchema = z.array(VesselSchema);
export type VesselUpdateOutput = z.infer<typeof VesselUpdateOutputSchema>;
