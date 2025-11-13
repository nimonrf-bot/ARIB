import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const warehouses = [
    { id: 1, name: "Warehouse A", location: "New York, NY" },
    { id: 2, name: "Warehouse B", location: "Los Angeles, CA" },
    { id: 3, name: "Warehouse C", location: "Chicago, IL" },
    { id: 4, name: "Warehouse D", location: "Houston, TX" },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="w-full max-w-7xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Warehouse Dashboard
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {warehouses.map((warehouse) => (
            <Card key={warehouse.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>{warehouse.name}</CardTitle>
                <CardDescription>{warehouse.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Contains various items and inventory data. Click to view details.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
