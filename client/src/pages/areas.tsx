import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AreaTable from "@/components/areas/area-table";
import AreaForm from "@/components/areas/area-form";
import { Area } from "@shared/schema";

export default function Areas() {
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | undefined>(undefined);

  const handleAddNew = () => {
    setEditMode(false);
    setSelectedArea(undefined);
    setShowForm(true);
  };

  const handleEdit = (area: Area) => {
    setEditMode(true);
    setSelectedArea(area);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditMode(false);
    setSelectedArea(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-4 sm:mb-0">Áreas</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Área
        </Button>
      </div>

      {/* Areas Table */}
      <AreaTable onEdit={handleEdit} />

      {/* Area Form Modal */}
      <AreaForm
        isOpen={showForm}
        onClose={handleCloseForm}
        editMode={editMode}
        area={selectedArea}
      />
    </div>
  );
}
