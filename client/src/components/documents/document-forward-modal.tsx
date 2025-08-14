import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Area, Employee } from "@shared/schema";

import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Label } from "@/components/ui/label";
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
  toEmployeeId: z.string().optional(),
  description: z.string().min(1, { message: "Descrição é obrigatória" }),
  deadlineDays: z.string().optional(),
  action: z.enum(["ATRIBUIR", "ENCAMINHAR", "FINALIZAR"]),
  toAreaId: z.string().optional(), // Para ação ENCAMINHAR
}).refine((data) => {
  if (data.action === "ATRIBUIR" && !data.toEmployeeId) {
    return false;
  }
  if (data.action === "ENCAMINHAR" && !data.toAreaId) {
    return false;
  }
  return true;
}, {
  message: "Campo obrigatório para a ação selecionada",
});

type ForwardFormValues = z.infer<typeof forwardFormSchema>;

interface DocumentForwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number;
  currentAreaId: number; // Agora é obrigatório para buscar funcionários da área
}

export default function DocumentForwardModal({
  isOpen,
  onClose,
  documentId,
  currentAreaId
}: DocumentForwardModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachmentDescription, setAttachmentDescription] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: areas = [] } = useQuery<Area[]>({
    queryKey: ["/api/areas"],
    enabled: isOpen
  });

  // Buscar funcionários da área atual do documento
  const { data: employees = [], isLoading: employeesLoading } = useQuery<Employee[]>({
    queryKey: [`/api/employees/area/${currentAreaId}`],
    enabled: isOpen && !!currentAreaId
  });

  const form = useForm<ForwardFormValues>({
    resolver: zodResolver(forwardFormSchema),
    defaultValues: {
      toEmployeeId: "",
      description: "",
      deadlineDays: "",
      action: "ATRIBUIR",
      toAreaId: ""
    }
  });

  const { action } = form.watch();

  // Resetar formulário quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      form.reset({
        toEmployeeId: "",
        description: "",
        deadlineDays: "",
        action: "ATRIBUIR",
        toAreaId: ""
      });
      setSelectedFile(null);
      setAttachmentDescription("");
    }
  }, [isOpen, form]);

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

  const assignEmployeeMutation = useMutation({
    mutationFn: async (values: ForwardFormValues) => {
      return apiRequest("POST", `/api/documents/${documentId}/assign-employee`, {
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
        description: "Responsável atribuído com sucesso",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atribuir responsável",
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const uploadAttachmentIfSelected = async () => {
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("category", "Anexo");
        formData.append("description", attachmentDescription || "Anexo do encaminhamento");
        formData.append("version", "1.0");

        const response = await fetch(`/api/documents/${documentId}/attachments`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Erro ao enviar anexo");
        }

        toast({
          title: "Anexo adicionado",
          description: "O anexo foi enviado junto com o encaminhamento.",
        });
      } catch (error) {
        toast({
          title: "Aviso",
          description: "Documento encaminhado, mas houve erro ao anexar o arquivo.",
          variant: "destructive",
        });
      }
    }
  };

  const onSubmit = async (values: ForwardFormValues) => {
    try {
      if (values.action === "ATRIBUIR") {
        await assignEmployeeMutation.mutateAsync(values);
      } else if (values.action === "ENCAMINHAR") {
        await forwardToAreaMutation.mutateAsync(values);
      } else if (values.action === "FINALIZAR") {
        toast({
          title: "Finalizar",
          description: "Funcionalidade de finalizar documento será implementada em breve",
        });
        return;
      }

      // Upload attachment after successful forward/assign
      await uploadAttachmentIfSelected();
    } catch (error) {
      // Error handling is already done in mutations
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Documento</DialogTitle>
          <DialogDescription>
            Escolha uma ação para o documento: atribuir responsável, encaminhar para outra área ou finalizar.
          </DialogDescription>
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
                      <SelectItem value="ATRIBUIR">Atribuir Responsável</SelectItem>
                      <SelectItem value="ENCAMINHAR">Encaminhar para Área</SelectItem>
                      <SelectItem value="FINALIZAR">Finalizar</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {action === "ATRIBUIR" && (
              <FormField
                control={form.control}
                name="toEmployeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Funcionário Responsável</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={employeesLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o funcionário responsável" />
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

            {action === "ENCAMINHAR" && (
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
            )}

            {(action === "ENCAMINHAR" || action === "ATRIBUIR") && (
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

            {/* Seção de Anexo */}
            <div className="space-y-2">
              <Label htmlFor="attachment">Anexar Arquivo (Opcional)</Label>
              <Input
                id="attachment"
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
              />
              {selectedFile && (
                <p className="text-sm text-green-600">
                  Arquivo selecionado: {selectedFile.name}
                </p>
              )}
              
              {selectedFile && (
                <div>
                  <Label htmlFor="attachment-description">Descrição do Anexo</Label>
                  <Input
                    id="attachment-description"
                    value={attachmentDescription}
                    onChange={(e) => setAttachmentDescription(e.target.value)}
                    placeholder="Descreva o anexo..."
                  />
                </div>
              )}
            </div>

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
                  forwardToEmployeeMutation.isPending ||
                  assignEmployeeMutation.isPending
                }
              >
                {forwardToAreaMutation.isPending || forwardToEmployeeMutation.isPending || assignEmployeeMutation.isPending
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