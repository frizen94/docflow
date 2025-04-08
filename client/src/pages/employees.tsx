import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmployeeTable from "@/components/employees/employee-table";
import EmployeeForm from "@/components/employees/employee-form";
import { Employee } from "@shared/schema";

export default function Employees() {
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(undefined);

  const handleAddNew = () => {
    setEditMode(false);
    setSelectedEmployee(undefined);
    setShowForm(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditMode(true);
    setSelectedEmployee(employee);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditMode(false);
    setSelectedEmployee(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-4 sm:mb-0">Employees</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Employee
        </Button>
      </div>

      {/* Employees Table */}
      <EmployeeTable onEdit={handleEdit} />

      {/* Employee Form Modal */}
      <EmployeeForm
        isOpen={showForm}
        onClose={handleCloseForm}
        editMode={editMode}
        employee={selectedEmployee}
      />
    </div>
  );
}
