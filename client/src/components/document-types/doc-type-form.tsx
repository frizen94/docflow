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
        title: `Document type ${editMode ? "updated" : "created"}`,
        description: `The document type has been ${editMode ? "updated" : "created"} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/document-types"] });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${editMode ? "update" : "create"} document type: ${error}`,
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
          <DialogTitle>{editMode ? "Edit Document Type" : "Add New Document Type"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter document type name" />
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
                    <FormDescription>Activate or deactivate this document type</FormDescription>
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
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Saving..." : editMode ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
