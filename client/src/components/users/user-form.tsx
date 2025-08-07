import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema, User, Employee, Area } from "@shared/schema";
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
import { Loader2 } from "lucide-react";

// Extended schema for form validation with password confirmation
const userFormSchema = insertUserSchema.extend({
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // Only check confirmPassword match when adding a new user or changing password
  if (!data.password) return true;
  return data.password === data.confirmPassword;
}, {
  message: "As senhas não correspondem",
  path: ["confirmPassword"],
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  editMode: boolean;
  user?: User;
}

export default function UserForm({ isOpen, onClose, editMode, user }: UserFormProps) {
  const { toast } = useToast();

  // Fetch employees and areas for dropdowns
  const { data: employees, isLoading: isLoadingEmployees } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: areas, isLoading: isLoadingAreas } = useQuery<Area[]>({
    queryKey: ["/api/areas"],
  });

  // Default values for the form
  const defaultValues: UserFormValues = {
    username: "",
    password: "", // Don't pre-fill password
    confirmPassword: "",
    name: "",
    role: "Usuário",
    areaId: undefined,
    employeeId: undefined,
    status: true,
  };

  // Form setup
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues,
  });
  
  // Update form when edit mode or user changes
  useEffect(() => {
    if (editMode && user) {
      form.reset({
        username: user.username || "",
        password: "", // Don't pre-fill password
        confirmPassword: "",
        name: user.name || "",
        role: user.role || "Usuário",
        areaId: user.areaId || undefined,
        employeeId: user.employeeId || undefined,
        status: user.status ?? true,
      });
    } else {
      form.reset(defaultValues);
    }
  }, [editMode, user, form, isOpen]);

  // Mutation for creating or updating users
  const mutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = values;
      
      // Handle password for edits
      let dataToSend = userData;
      
      if (editMode && user) {
        const res = await apiRequest("PUT", `/api/users/${user.id}`, dataToSend);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/users", dataToSend);
        return res.json();
      }
    },
    onSuccess: () => {
      toast({
        title: `Usuário ${editMode ? "atualizado" : "criado"}`,
        description: `O usuário foi ${editMode ? "atualizado" : "criado"} com sucesso.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      onClose();
      form.reset(defaultValues);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao ${editMode ? "atualizar" : "criar"} usuário: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: UserFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editMode ? "Editar Usuário" : "Adicionar Novo Usuário"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de Usuário</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Digite o nome de usuário" 
                      disabled={editMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Digite o nome completo do usuário" 
                    />
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
                  {isLoadingAreas ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Carregando áreas...</span>
                    </div>
                  ) : areas && areas.length > 0 ? (
                    <Select
                      onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma área" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Nenhuma área</SelectItem>
                        {areas.map((area) => (
                          <SelectItem 
                            key={area.id} 
                            value={area.id.toString()}
                          >
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded-md">
                      Nenhuma área cadastrada.
                    </div>
                  )}
                  <FormDescription>
                    Selecione a área do usuário para controle de acesso aos documentos.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Funcionário Associado (Opcional)</FormLabel>
                  {isLoadingEmployees ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Carregando funcionários...</span>
                    </div>
                  ) : employees && employees.length > 0 ? (
                    <Select
                      onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um funcionário" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Nenhum funcionário</SelectItem>
                        {employees.map((employee) => (
                          <SelectItem 
                            key={employee.id} 
                            value={employee.id.toString()}
                          >
                            {`${employee.firstName} ${employee.lastName}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded-md">
                      Nenhum funcionário cadastrado.
                    </div>
                  )}
                  <FormDescription>
                    Associe um funcionário para permitir atribuição de documentos específicos.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{editMode ? "Nova Senha (deixe em branco para manter atual)" : "Senha"}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="password" 
                        placeholder={editMode ? "Digite a nova senha" : "Digite a senha"} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="password" 
                        placeholder="Confirme a senha" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um perfil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Administrator">Administrador</SelectItem>
                      <SelectItem value="Usuário">Usuário</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <FormDescription>Ativar ou desativar este usuário</FormDescription>
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
