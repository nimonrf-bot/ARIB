import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { vessels, warehouses, type Vessel, type Warehouse } from "@/lib/data";
import Link from "next/link";

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
        <div className="flex justify-between items-center w-full mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
            Vessel-Watch
            </h1>
            <Link href="/admin" className="font-medium text-primary hover:underline">
                Admin Panel
            </Link>
        </div>
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
