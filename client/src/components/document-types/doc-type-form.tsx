import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertDocumentTypeSchema, DocumentType } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Schema for form validation
const docTypeFormSchema = insertDocumentTypeSchema;
type DocTypeFormValues = z.infer<typeof docTypeFormSchema>;

interface DocTypeFormProps {
  isOpen: boolean;
  onClose: () => void;
  editMode: boolean;
  docType?: DocumentType;
}

export default function DocTypeForm({ isOpen, onClose, editMode, docType }: DocTypeFormProps) {
  const { toast } = useToast();

  // Default values for the form
  const defaultValues: DocTypeFormValues = {
    name: docType?.name || "",
    status: docType?.status ?? true,
  };

  // Form setup
  const form = useForm<DocTypeFormValues>({
    resolver: zodResolver(docTypeFormSchema),
    defaultValues,
  });

  // Mutation for creating or updating document types
  const mutation = useMutation({
    mutationFn: async (values: DocTypeFormValues) => {
      if (editMode && docType) {
        const res = await apiRequest("PUT", `/api/document-types/${docType.id}`, values);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/document-types", values);
        return res.json();
      }
    },
    onSuccess: () => {
      toast({
        title: `Tipo de documento ${editMode ? "atualizado" : "criado"}`,
        description: `O tipo de documento foi ${editMode ? "atualizado" : "criado"} com sucesso.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/document-types"] });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao ${editMode ? "atualizar" : "criar"} tipo de documento: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: DocTypeFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editMode ? "Editar Tipo de Documento" : "Adicionar Novo Tipo de Documento"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Tipo de Documento</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digite o nome do tipo de documento" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Status</FormLabel>
                    <FormDescription>Ativar ou desativar este tipo de documento</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Salvando..." : editMode ? "Atualizar" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
