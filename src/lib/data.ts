// In a real application, you would fetch this data from a database.
// For this prototype, we're using a simple in-memory store.

export interface Vessel {
  id: number;
  cargo: string;
  vesselName: string;
  vesselId: string;
  departureDate: string;
  etaDate: string;
  anchored: boolean;
  origin: string;
  destination: string;
  progress: number; // Will be calculated dynamically
  status: string;
}

export interface WarehouseBin {
  id: string;
  commodity: string;
  tonnage: number;
  code: string;
}

export interface Warehouse {
  id: number;
  name: string;
  totalCapacity: number;
  bins: WarehouseBin[];
}

const today = new Date();
const getFutureDate = (days: number) => {
    const date = new Date();
    date.setDate(today.getDate() + days);
    return date.toISOString().split('T')[0];
}
const getPastDate = (days: number) => {
    const date = new Date();
    date.setDate(today.getDate() - days);
    return date.toISOString().split('T')[0];
}


export const vessels: Vessel[] = [
    { id: 1, cargo: "N/A", vesselName: "Omskiy-130", vesselId: "OM-130", departureDate: getPastDate(2), etaDate: getFutureDate(10), anchored: true, origin: "Caspian port", destination: "Arib port", progress: 0, status: "Arrived at Caspian Port, waiting for port entry." },
    { id: 2, cargo: "N/A", vesselName: "Omskiy-131", vesselId: "OM-131", departureDate: getPastDate(5), etaDate: getFutureDate(8), anchored: false, origin: "Caspian port", destination: "Arib port", progress: 0, status: "Waiting for entry into the canal." },
    { id: 3, cargo: "N/A", vesselName: "Omskiy-86", vesselId: "OM-86", departureDate: getPastDate(3), etaDate: getFutureDate(12), anchored: true, origin: "Caspian port", destination: "Arib port", progress: 0, status: "Completed loading, waiting for fumigation and cargo documents." },
    { id: 4, cargo: "N/A", vesselName: "Omskiy-128", vesselId: "OM-128", departureDate: getPastDate(1), etaDate: getFutureDate(14), anchored: true, origin: "Caspian port", destination: "Arib port", progress: 0, status: "Arrived at Caspian Port, waiting for port entry." },
    { id: 5, cargo: "Big Bags", vesselName: "Omskiy-129", vesselId: "OM-129", departureDate: getPastDate(4), etaDate: getFutureDate(9), anchored: false, origin: "Caspian port", destination: "Arib port", progress: 0, status: "Loading at Caspian Port; 1,257 big bags loaded." },
    { id: 6, cargo: "N/A", vesselName: "Omskiy-89", vesselId: "OM-89", departureDate: getPastDate(6), etaDate: getFutureDate(7), anchored: false, origin: "Caspian port", destination: "Arib port", progress: 0, status: "Waiting for entry into the canal." },
    { id: 7, cargo: "Cement", vesselName: "Omskiy-136", vesselId: "OM-136", departureDate: getPastDate(2), etaDate: getFutureDate(11), anchored: false, origin: "Caspian port", destination: "Arib port", progress: 0, status: "Arrived at Caspian Port; cement loading begun, 212 big bags loaded." },
];

export const warehouses: Warehouse[] = [
  {
    id: 1,
    name: "Warehouse 9",
    totalCapacity: 12000,
    bins: [
      { id: "9A", commodity: "Corn", tonnage: 2900, code: "AFRA" },
      { id: "9B", commodity: "Barley", tonnage: 3000, code: "TEHR" },
      { id: "9C", commodity: "Wheat", tonnage: 1500, code: "KILI" },
      { id: "9D", commodity: "Soy", tonnage: 2100, code: "RIVA" },
    ],
  },
  {
    id: 2,
    name: "Warehouse 7",
    totalCapacity: 15000,
    bins: [
      { id: "7A", commodity: "Rice", tonnage: 4000, code: "SINO" },
      { id: "7B", commodity: "Canola", tonnage: 3500, code: "LUMA" },
      { id: "7C", commodity: "Oats", tonnage: 2000, code: "PIRA" },
      { id: "7D", commodity: "Corn", tonnage: 3000, code: "GALE" },
    ],
  },
  {
    id: 3,
    name: "Warehouse 12",
    totalCapacity: 10000,
    bins: [
      { id: "12A", commodity: "Barley", tonnage: 2500, code: "ZEph" },
      { id: "12B", commodity: "Wheat", tonnage: 2500, code: "TRIT" },
      { id: "12C", commodity: "Soy", tonnage: 2500, code: "MYRA" },
      { id: "12D", commodity: "Oats", tonnage: 1500, code: "NESO" },
    ],
  },
];
