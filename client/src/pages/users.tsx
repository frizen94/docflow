import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserTable from "@/components/users/user-table";
import UserForm from "@/components/users/user-form";
import { User } from "@shared/schema";
import { isAdmin } from "@/lib/auth";

export default function Users() {
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

  const handleAddNew = () => {
    setEditMode(false);
    setSelectedUser(undefined);
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setEditMode(true);
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditMode(false);
    setSelectedUser(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-4 sm:mb-0">Users</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New User
        </Button>
      </div>

      {/* Users Table */}
      <UserTable onEdit={handleEdit} />

      {/* User Form Modal */}
      <UserForm
        isOpen={showForm}
        onClose={handleCloseForm}
        editMode={editMode}
        user={selectedUser}
      />
    </div>
  );
}
