import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DocTypeTable from "@/components/document-types/doc-type-table";
import DocTypeForm from "@/components/document-types/doc-type-form";
import { DocumentType } from "@shared/schema";

export default function DocumentTypes() {
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | undefined>(undefined);

  const handleAddNew = () => {
    setEditMode(false);
    setSelectedDocType(undefined);
    setShowForm(true);
  };

  const handleEdit = (docType: DocumentType) => {
    setEditMode(true);
    setSelectedDocType(docType);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditMode(false);
    setSelectedDocType(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-4 sm:mb-0">Tipos de Documento</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Tipo de Documento
        </Button>
      </div>

      {/* Document Types Table */}
      <DocTypeTable onEdit={handleEdit} />

      {/* Document Type Form Modal */}
      <DocTypeForm
        isOpen={showForm}
        onClose={handleCloseForm}
        editMode={editMode}
        docType={selectedDocType}
      />
    </div>
  );
}
