import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Area, Employee } from "@shared/schema";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const forwardFormSchema = z.object({
  toAreaId: z.string().min(1, { message: "Área de destino é obrigatória" }),
  description: z.string().min(1, { message: "Descrição é obrigatória" }),
  deadlineDays: z.string().optional(),
  toEmployeeId: z.string().optional(),
  action: z.enum(["ENCAMINHAR", "FINALIZAR"]),
});

type ForwardFormValues = z.infer<typeof forwardFormSchema>;

interface DocumentForwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number;
  currentAreaId?: number;
}

export default function DocumentForwardModal({
  isOpen,
  onClose,
  documentId,
  currentAreaId
}: DocumentForwardModalProps) {
  const [forwardToEmployee, setForwardToEmployee] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: areas = [] } = useQuery<Area[]>({
    queryKey: ["/api/areas"],
    enabled: isOpen
  });

  const { data: employees = [], isLoading: employeesLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
    enabled: isOpen && forwardToEmployee
  });

  const form = useForm<ForwardFormValues>({
    resolver: zodResolver(forwardFormSchema),
    defaultValues: {
      toAreaId: "",
      description: "",
      deadlineDays: "",
      toEmployeeId: "",
      action: "ENCAMINHAR"
    }
  });

  const { action, toAreaId } = form.watch();

  // Resetar formulário quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      form.reset({
        toAreaId: "",
        description: "",
        deadlineDays: "",
        toEmployeeId: "",
        action: "ENCAMINHAR"
      });
      setForwardToEmployee(false);
    }
  }, [isOpen, form]);

  // Mostrar/esconder campos de area baseado na ação selecionada
  useEffect(() => {
    if (action === "FINALIZAR") {
      setForwardToEmployee(false);
    }
  }, [action]);

  const forwardToAreaMutation = useMutation({
    mutationFn: async (values: ForwardFormValues) => {
      return apiRequest("POST", `/api/documents/${documentId}/forward-to-area`, {
        toAreaId: values.toAreaId,
        description: values.description,
        deadlineDays: values.deadlineDays 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: [`/api/document-tracking/document/${documentId}`] });
      toast({
        title: "Sucesso",
        description: "Documento encaminhado com sucesso",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao encaminhar documento",
        variant: "destructive",
      });
    },
  });

  const forwardToEmployeeMutation = useMutation({
    mutationFn: async (values: ForwardFormValues) => {
      return apiRequest("POST", `/api/documents/${documentId}/forward-to-employee`, {
        toAreaId: values.toAreaId,
        toEmployeeId: values.toEmployeeId,
        description: values.description,
        deadlineDays: values.deadlineDays 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: [`/api/document-tracking/document/${documentId}`] });
      toast({
        title: "Sucesso",
        description: "Documento encaminhado com sucesso para o funcionário",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao encaminhar documento para funcionário",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ForwardFormValues) => {
    if (values.action === "FINALIZAR") {
      // Lógica para finalizar o documento
      toast({
        title: "Finalizar",
        description: "Funcionalidade de finalizar documento será implementada em breve",
      });
      return;
    }

    if (forwardToEmployee && values.toEmployeeId) {
      forwardToEmployeeMutation.mutate(values);
    } else {
      forwardToAreaMutation.mutate(values);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Encaminhar Documento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ação</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma ação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ENCAMINHAR">Encaminhar</SelectItem>
                      <SelectItem value="FINALIZAR">Finalizar</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {action === "ENCAMINHAR" && (
              <>
                <FormField
                  control={form.control}
                  name="toAreaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área de Destino</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a área de destino" />
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

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="forward-to-employee"
                    checked={forwardToEmployee}
                    onChange={(e) => setForwardToEmployee(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="forward-to-employee">
                    Encaminhar para um funcionário específico
                  </label>
                </div>

                {forwardToEmployee && toAreaId && (
                  <FormField
                    control={form.control}
                    name="toEmployeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Funcionário</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={employeesLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o funcionário" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employees?.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id.toString()}>
                                {employee.firstName} {employee.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            {action === "ENCAMINHAR" && (
              <FormField
                control={form.control}
                name="deadlineDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prazo em Dias</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Informe o prazo em dias"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informe detalhes sobre o encaminhamento"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
                disabled={
                  forwardToAreaMutation.isPending || 
                  forwardToEmployeeMutation.isPending
                }
              >
                {forwardToAreaMutation.isPending || forwardToEmployeeMutation.isPending 
                  ? "Processando..." 
                  : "Confirmar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}