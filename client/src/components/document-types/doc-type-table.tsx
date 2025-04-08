import { useQuery, useMutation } from "@tanstack/react-query";
import { DocumentType } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface DocTypeTableProps {
  onEdit: (docType: DocumentType) => void;
}

export default function DocTypeTable({ onEdit }: DocTypeTableProps) {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docTypeToDelete, setDocTypeToDelete] = useState<DocumentType | null>(null);

  // Fetch document types
  const { data: docTypes, isLoading } = useQuery<DocumentType[]>({
    queryKey: ["/api/document-types"],
  });

  // Delete document type mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/document-types/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Tipo de documento excluído",
        description: "O tipo de documento foi excluído com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/document-types"] });
      setDeleteDialogOpen(false);
      setDocTypeToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao excluir tipo de documento: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (docType: DocumentType) => {
    setDocTypeToDelete(docType);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (docTypeToDelete) {
      deleteMutation.mutate(docTypeToDelete.id);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Tipo de Documento</TableHead>
              <TableHead>Data de Registro</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : docTypes && docTypes.length > 0 ? (
              docTypes.map((docType) => (
                <TableRow key={docType.id}>
                  <TableCell className="font-medium">{docType.id}</TableCell>
                  <TableCell>{docType.name}</TableCell>
                  <TableCell>
                    {format(new Date(docType.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        docType.status
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {docType.status ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(docType)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(docType)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                  Nenhum tipo de documento encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso excluirá permanentemente o tipo de documento "{docTypeToDelete?.name}". Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
