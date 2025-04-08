import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertAreaSchema, Area } from "@shared/schema";
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
const areaFormSchema = insertAreaSchema;
type AreaFormValues = z.infer<typeof areaFormSchema>;

interface AreaFormProps {
  isOpen: boolean;
  onClose: () => void;
  editMode: boolean;
  area?: Area;
}

export default function AreaForm({ isOpen, onClose, editMode, area }: AreaFormProps) {
  const { toast } = useToast();

  // Default values for the form
  const defaultValues: AreaFormValues = {
    name: area?.name || "",
    status: area?.status ?? true,
  };

  // Form setup
  const form = useForm<AreaFormValues>({
    resolver: zodResolver(areaFormSchema),
    defaultValues,
  });

  // Mutation for creating or updating areas
  const mutation = useMutation({
    mutationFn: async (values: AreaFormValues) => {
      if (editMode && area) {
        const res = await apiRequest("PUT", `/api/areas/${area.id}`, values);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/areas", values);
        return res.json();
      }
    },
    onSuccess: () => {
      toast({
        title: `Area ${editMode ? "updated" : "created"}`,
        description: `The area has been ${editMode ? "updated" : "created"} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/areas"] });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${editMode ? "update" : "create"} area: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: AreaFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editMode ? "Edit Area" : "Add New Area"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter area name" />
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
                    <FormDescription>Activate or deactivate this area</FormDescription>
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
