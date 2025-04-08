import { useState } from "react";
import { useLocation } from "wouter";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DocumentTable from "@/components/documents/document-table";
import DocumentFilters from "@/components/documents/document-filters";

export default function Documents() {
  const [_, setLocation] = useLocation();
  const [filters, setFilters] = useState({
    status: "all",
    areaId: "all",
    search: "",
  });

  const handleFilterChange = (newFilters: {
    status: string;
    areaId: string;
    search: string;
  }) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-4 sm:mb-0">Documentos</h1>
        <Button onClick={() => setLocation("/documents/new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Documento
        </Button>
      </div>

      {/* Filters */}
      <DocumentFilters onFilterChange={handleFilterChange} />

      {/* Documents Table */}
      <DocumentTable 
        status={filters.status !== "all" ? filters.status : undefined} 
        areaId={filters.areaId !== "all" ? Number(filters.areaId) : undefined} 
      />
    </div>
  );
}
