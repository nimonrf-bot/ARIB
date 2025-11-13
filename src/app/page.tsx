'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { vessels as defaultVessels, warehouses as defaultWarehouses, type Vessel, type Warehouse } from "@/lib/data";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useTranslation } from "@/context/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";


const ShipIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 120 60"
    fill="none"
    stroke="currentColor"
    strokeWidth="4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 35 H110 L105 45 C103 48 100 50 95 50 H25 C18 50 13 48 10 45 L5 35 Z" />
    <line x1="10" y1="35" x2="105" y2="35" />
    <rect x="28" y="25" width="12" height="10" rx="1" />
    <rect x="42" y="25" width="12" height="10" rx="1" />
    <rect x="56" y="25" width="12" height="10" rx="1" />
    <rect x="70" y="25" width="12" height="10" rx="1" />
    <rect x="84" y="25" width="12" height="10" rx="1" />
    <path d="M18 35 V18 H30 V35 Z" />
    <path d="M30 18 L25 12 H18" />
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

const PortIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 300"
      fill="none"
      stroke="currentColor"
      strokeWidth="14"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M70 250 L70 210 L110 210 L110 250" />
      <path d="M190 250 L190 210 L230 210 L230 250" />
      <rect x="70" y="180" width="160" height="30" rx="4" />
      <rect x="90" y="150" width="120" height="30" rx="4" />
      <rect x="100" y="120" width="100" height="30" rx="4" />
      <rect x="110" y="90" width="80" height="30" rx="4" />
      <path d="M140 90 L260 40" />
      <path d="M180 90 L260 40" />
      <line x1="260" y1="40" x2="260" y2="120" />
      <circle cx="260" cy="145" r="5" fill="black" />
    </svg>
);

const VesselJourneyCard = ({ vessel }: { vessel: Vessel }) => {
  return (
    <Card className="w-full p-4 bg-white shadow-lg rounded-xl">
      <CardContent className="p-0">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {vessel.vesselName} ({vessel.vesselId})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-semibold">Cargo:</span> {vessel.cargo}
            </p>
          </div>
          <div className="text-right">
             <p className="text-lg text-gray-600">ETA: {vessel.eta}</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-800 mb-4">{vessel.status}</p>

        <div className="relative pt-4 pb-2">
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-2">
              <PortIcon className="w-8 h-8 text-gray-700"/>
              <p className="text-md font-semibold">{vessel.origin}</p>
            </div>
            <div className="flex-grow h-0.5 bg-black mx-4 mb-4" />
            <div className="flex items-center gap-2">
              <p className="text-md font-semibold">{vessel.destination}</p>
              <PortIcon className="w-8 h-8 text-gray-700"/>
            </div>
          </div>

          <div
            className="absolute bottom-0 transform -translate-y-1/2"
            style={{ left: `calc(${vessel.progress}% - 24px)` }}
          >
             <div className="relative w-12 h-12">
                <ShipIcon className="w-12 h-12 text-gray-600" />
                <FlagIcon className="absolute -top-1 right-2"/>
              </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const WarehouseCard = ({ warehouse }: { warehouse: Warehouse }) => {
  const currentStock = warehouse.bins.reduce((acc, bin) => acc + bin.tonnage, 0);
  const fillPercentage = (currentStock / warehouse.totalCapacity) * 100;
  const remainingCapacity = warehouse.totalCapacity - currentStock;
  const isCritical = fillPercentage > 90;

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
                <p className="font-semibold">{bin.tonnage.toLocaleString()}T</p>
                <p className="text-sm text-gray-500">{bin.code}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between w-20">
            <div className="w-full h-full flex flex-col justify-end">
                <Progress value={fillPercentage} className={cn("w-full h-full [&>div]:bg-green-500", { "[&>div]:bg-red-500": isCritical })} orientation="vertical" />
            </div>
            <p className="text-sm font-semibold mt-2">{Math.round(fillPercentage)}%</p>
          </div>
        </div>
        <div className="text-center mt-4 space-y-1">
          <p className="font-bold text-lg">
            Total Capacity: {warehouse.totalCapacity.toLocaleString()}T
          </p>
          <p className={cn("font-semibold", isCritical ? "text-red-600" : "text-green-600")}>
            {isCritical ? 'Capacity Critical' : 'Available'}: {remainingCapacity.toLocaleString()}T
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Home() {
  const [vessels, setVessels] = useState<Vessel[]>(defaultVessels);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(defaultWarehouses);
  const { t } = useTranslation();

  useEffect(() => {
    const savedVessels = localStorage.getItem('vessels');
    if (savedVessels) {
      setVessels(JSON.parse(savedVessels));
    }
    const savedWarehouses = localStorage.getItem('warehouses');
    if (savedWarehouses) {
      setWarehouses(JSON.parse(savedWarehouses));
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 bg-gray-50">
      <div className="w-full max-w-7xl">
        <div className="flex justify-between items-center w-full mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
             {t('vesselWatchTitle')}
            </h1>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link href="/admin" className="font-medium text-primary hover:underline">
                  {t('adminPanelLink')}
              </Link>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {vessels.map((vessel) => (
            <VesselJourneyCard key={vessel.id} vessel={vessel} />
          ))}
        </div>

        <h1 className="text-3xl font-bold my-8 text-center text-gray-800">
          {t('warehouseStatusTitle')}
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
