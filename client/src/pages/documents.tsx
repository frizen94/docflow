import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DocumentTable from "@/components/documents/document-table";
import DocumentFilters from "@/components/documents/document-filters";
import DocumentFormModal from "@/components/documents/document-form-modal";
import { Document } from "@shared/schema";

export default function Documents() {
  const [filters, setFilters] = useState({
    status: "all",
    areaId: "all",
    search: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const handleFilterChange = (newFilters: {
    status: string;
    areaId: string;
    search: string;
  }) => {
    setFilters(newFilters);
  };

  const handleAddNew = () => {
    setEditMode(false);
    setSelectedDocument(null);
    setShowForm(true);
  };

  const handleEdit = (document: Document) => {
    setEditMode(true);
    setSelectedDocument(document);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditMode(false);
    setSelectedDocument(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-4 sm:mb-0">Documentos</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Cadastrar Documento
        </Button>
      </div>

      {/* Filters */}
      <DocumentFilters onFilterChange={handleFilterChange} />

      {/* Documents Table */}
      <DocumentTable 
        status={filters.status !== "all" ? filters.status : undefined} 
        areaId={filters.areaId !== "all" ? Number(filters.areaId) : undefined}
        onEdit={handleEdit}
      />

      {/* Document Form Modal */}
      <DocumentFormModal 
        isOpen={showForm}
        onClose={handleCloseForm}
        editMode={editMode}
        documentId={selectedDocument?.id}
      />
    </div>
  );
}
