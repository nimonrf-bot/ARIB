import { Card, CardContent } from "@/components/ui/card";

// Using an inline SVG for the ship icon as it's not in lucide-react.
const ShipIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 40h40l-4-16H16z" />
    <path d="M24 24h16v-8H24z" />
    <path d="M30 16V8" />
    <path d="M20 40s-4 8 12 8 12-8 12-8" />
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
}

const vessels: Vessel[] = [
  { id: 1, cargo: "Corn", vesselName: "Astra", vesselId: "OM-128", eta: "25/11/2025", origin: "Astra", destination: "Casp", progress: 40 },
  { id: 2, cargo: "Wheat", vesselName: "Luna", vesselId: "WX-345", eta: "12/12/2025", origin: "Porto", destination: "Kili", progress: 75 },
  { id: 3, cargo: "Soybeans", vesselName: "Sol", vesselId: "YZ-987", eta: "05/01/2026", origin: "Baki", destination: "Riva", progress: 20 },
  { id: 4, cargo: "Barley", vesselName: "Terra", vesselId: "FG-456", eta: "18/02/2026", origin: "Sino", destination: "Luma", progress: 90 },
  { id: 5, cargo: "Rice", vesselName: "Neptune", vesselId: "AB-213", eta: "30/03/2026", origin: "Gale", destination: "Pira", progress: 50 },
  { id: 6, cargo: "Canola", vesselName: "Orion", vesselId: "CD-789", eta: "15/04/2026", origin: "Zeph", destination: "Trit", progress: 10 },
  { id: 7, cargo: "Oats", vesselName: "Sirius", vesselId: "EF-101", eta: "22/05/2026", origin: "Myra", destination: "Neso", progress: 65 },
];

const VesselJourneyCard = ({ vessel }: { vessel: Vessel }) => {
  return (
    <Card className="w-full max-w-lg p-6 bg-white shadow-lg rounded-xl">
      <CardContent className="p-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Cargo: {vessel.cargo}
          </h2>
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


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 bg-gray-50">
      <div className="w-full max-w-7xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Vessel-Watch
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {vessels.map((vessel) => (
            <VesselJourneyCard key={vessel.id} vessel={vessel} />
          ))}
        </div>
      </div>
    </main>
  );
}