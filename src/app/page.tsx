import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Using an inline SVG for the ship icon as it's not in lucide-react.
const ShipIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 20h20" />
      <path d="M12 4V9" />
      <path d="M12 9l-4 11h16L12 9z" />
      <path d="M10 14h4" />
    </svg>
  );

const FlagIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="12" height="12" rx="2" fill="#0047AB" />
    <text
      x="6"
      y="8.5"
      textAnchor="middle"
      fill="white"
      fontSize="8"
      fontWeight="bold"
    >
      F
    </text>
  </svg>
);


interface Vessel {
  id: number;
  cargo: string;
  vesselName: string;
  vesselId: string;
  eta: string;
  origin: string;
  destination: string;
  progress: number;
  status: string;
}

const vessels: Vessel[] = [
  { id: 1, cargo: "N/A", vesselName: "Omskiy-130", vesselId: "OM-130", eta: "TBD", origin: "Caspian port", destination: "Arib port", progress: 5, status: "Arrived at Caspian Port, waiting for port entry." },
  { id: 2, cargo: "N/A", vesselName: "Omskiy-131", vesselId: "OM-131", eta: "TBD", origin: "Caspian port", destination: "Arib port", progress: 30, status: "Waiting for entry into the canal." },
  { id: 3, cargo: "N/A", vesselName: "Omskiy-86", vesselId: "OM-86", eta: "TBD", origin: "Caspian port", destination: "Arib port", progress: 15, status: "Completed loading, waiting for fumigation and cargo documents." },
  { id: 4, cargo: "N/A", vesselName: "Omskiy-128", vesselId: "OM-128", eta: "TBD", origin: "Caspian port", destination: "Arib port", progress: 5, status: "Arrived at Caspian Port, waiting for port entry." },
  { id: 5, cargo: "Big Bags", vesselName: "Omskiy-129", vesselId: "OM-129", eta: "TBD", origin: "Caspian port", destination: "Arib port", progress: 10, status: "Loading at Caspian Port; 1,257 big bags loaded." },
  { id: 6, cargo: "N/A", vesselName: "Omskiy-89", vesselId: "OM-89", eta: "TBD", origin: "Caspian port", destination: "Arib port", progress: 30, status: "Waiting for entry into the canal." },
  { id: 7, cargo: "Cement", vesselName: "Omskiy-136", vesselId: "OM-136", eta: "TBD", origin: "Caspian port", destination: "Arib port", progress: 10, status: "Arrived at Caspian Port; cement loading begun, 212 big bags loaded." },
];

const VesselJourneyCard = ({ vessel }: { vessel: Vessel }) => {
  return (
    <Card className="w-full max-w-lg p-6 bg-white shadow-lg rounded-xl">
      <CardContent className="p-0">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h2 className="text-xl font-bold text-gray-800">
                    Cargo: {vessel.cargo}
                </h2>
                <p className="text-sm text-gray-600 mt-1">{vessel.status}</p>
            </div>
          <p className="text-lg text-gray-600">ETA: {vessel.eta}</p>
        </div>

        <div className="relative pt-8 pb-10">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-orange-100 border-2 border-black" />
              <p className="mt-2 text-lg font-semibold">{vessel.origin}</p>
            </div>
            <div className="flex-grow h-0.5 bg-black mx-4" />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-orange-100 border-2 border-black" />
              <p className="mt-2 text-lg font-semibold">{vessel.destination}</p>
            </div>
          </div>

          <div
            className="absolute bottom-6 transform -translate-y-1/2"
            style={{ left: `calc(${vessel.progress}% - 24px)` }}
          >
            <div className="flex flex-col items-center">
              <div className="relative">
                <ShipIcon className="w-12 h-12 text-gray-600" />
                <FlagIcon className="absolute -top-1 right-2"/>
              </div>
              <p className="mt-1 text-sm font-medium text-gray-700">
                {vessel.vesselId}
              </p>
              <div className="absolute top-8 left-1/2 -translate-x-1/2">
                <svg
                  width="20"
                  height="10"
                  viewBox="0 0 20 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 5H19"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 1L19 5L14 9"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center">
            <p className="text-xl font-bold text-gray-800">{vessel.vesselName}</p>
        </div>
      </CardContent>
    </Card>
  );
};

interface WarehouseBin {
  id: string;
  commodity: string;
  tonnage: number;
  code: string;
}

interface Warehouse {
  id: number;
  name: string;
  totalCapacity: number;
  bins: WarehouseBin[];
}

const warehouses: Warehouse[] = [
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

const WarehouseCard = ({ warehouse }: { warehouse: Warehouse }) => {
  const currentStock = warehouse.bins.reduce((acc, bin) => acc + bin.tonnage, 0);
  const fillPercentage = (currentStock / warehouse.totalCapacity) * 100;

  return (
    <Card className="w-full max-w-lg p-6 bg-white shadow-lg rounded-xl">
      <CardContent className="p-0">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">{warehouse.name}</h2>
        <div className="flex gap-4">
          <div className="flex-grow grid grid-cols-2 grid-rows-2 border border-gray-300">
            {warehouse.bins.map((bin, index) => (
              <div key={bin.id} className={`p-3 text-center border-gray-300
                ${index === 0 ? 'border-r border-b' : ''}
                ${index === 1 ? 'border-b' : ''}
                ${index === 2 ? 'border-r' : ''}
              `}>
                <p className="font-bold text-lg">{bin.id}</p>
                <p>{bin.commodity}</p>
                <p className="font-semibold">{bin.tonnage}T</p>
                <p className="text-sm text-gray-500">{bin.code}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between w-20">
            <div className="w-full h-full flex flex-col justify-end">
                <Progress value={fillPercentage} className="w-full h-full [&>div]:bg-blue-500" orientation="vertical" />
            </div>
            <p className="text-sm font-semibold mt-2">{Math.round(fillPercentage)}%</p>
          </div>
        </div>
        <p className="text-center mt-4 font-bold text-lg">
          Total Capacity: {warehouse.totalCapacity.toLocaleString()}T
        </p>
      </CardContent>
    </Card>
  )
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 bg-gray-50">
      <div className="w-full max-w-7xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Vessel-Watch
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {vessels.map((vessel) => (
            <VesselJourneyCard key={vessel.id} vessel={vessel} />
          ))}
        </div>

        <h1 className="text-3xl font-bold my-8 text-center text-gray-800">
          Warehouse Status
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
           {warehouses.map((warehouse) => (
            <WarehouseCard key={warehouse.id} warehouse={warehouse} />
          ))}
        </div>
      </div>
    </main>
  );
}
