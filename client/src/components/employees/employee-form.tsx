import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertEmployeeSchema, Employee, Area } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Schema for form validation
const employeeFormSchema = insertEmployeeSchema;
type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  editMode: boolean;
  employee?: Employee;
}

export default function EmployeeForm({ isOpen, onClose, editMode, employee }: EmployeeFormProps) {
  const { toast } = useToast();

  // Fetch areas for the dropdown
  const { data: areas } = useQuery<Area[]>({
    queryKey: ["/api/areas"],
  });

  // Default values for the form
  const defaultValues: EmployeeFormValues = {
    dni: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    areaId: 0,
    status: true,
  };

  // Form setup
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues,
  });

  // Update form when props change (important for edit mode)
  useEffect(() => {
    if (editMode && employee) {
      form.reset({
        dni: employee.dni || "",
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
        phone: employee.phone || "",
        areaId: employee.areaId,
        status: employee.status,
      });
    } else {
      form.reset(defaultValues);
    }
  }, [editMode, employee, form, isOpen]);

  // Mutation for creating or updating employees
  const mutation = useMutation({
    mutationFn: async (values: EmployeeFormValues) => {
      if (editMode && employee) {
        const res = await apiRequest("PUT", `/api/employees/${employee.id}`, values);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/employees", values);
        return res.json();
      }
    },
    onSuccess: () => {
      toast({
        title: `Funcionário ${editMode ? "atualizado" : "criado"}`,
        description: `O funcionário foi ${editMode ? "atualizado" : "criado"} com sucesso.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      onClose();
      form.reset(defaultValues);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao ${editMode ? "atualizar" : "criar"} funcionário: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: EmployeeFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editMode ? "Editar Funcionário" : "Adicionar Novo Funcionário"}</DialogTitle>
          <DialogDescription>
            {editMode 
              ? "Atualize as informações do funcionário" 
              : "Preencha as informações para cadastrar um novo funcionário"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dni"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Digite o CPF" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="areaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      defaultValue={field.value ? field.value.toString() : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma área" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {areas?.map((area) => (
                          <SelectItem key={area.id} value={area.id.toString()}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Digite o nome" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobrenome</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Digite o sobrenome" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Digite o email" 
                        type="email" 
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Digite o telefone"
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Status</FormLabel>
                    <FormDescription>Ativar ou desativar este funcionário</FormDescription>
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
