import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertDocumentSchema, Document, Area, DocumentType } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

// Extended schema for form validation
const documentFormSchema = insertDocumentSchema
  .extend({
    deadlineDays: z.number().int().min(1, {
      message: "O prazo deve ser de pelo menos 1 dia",
    }).optional(),
    filePath: z.string().optional().transform(val => val || ''),
  })
  .omit({ trackingNumber: true, deadline: true, folios: true });

type DocumentFormValues = z.infer<typeof documentFormSchema>;

interface DocumentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editMode?: boolean;
  documentId?: number;
}

export default function DocumentFormModal({ 
  isOpen, 
  onClose, 
  editMode = false, 
  documentId 
}: DocumentFormModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch areas for select
  const { data: areas, isLoading: isLoadingAreas } = useQuery<Area[]>({
    queryKey: ["/api/areas"],
  });

  // Fetch document types for select
  const { data: docTypes, isLoading: isLoadingDocTypes } = useQuery<DocumentType[]>({
    queryKey: ["/api/document-types"],
  });

  // Fetch document data if in edit mode
  const { data: document, isLoading: isLoadingDocument } = useQuery<Document>({
    queryKey: [`/api/documents/${documentId || ''}`],
    enabled: editMode && !!documentId,
  });

  // Generate default values for form
  const getDefaultValues = (): Partial<DocumentFormValues> => {
    if (editMode && document) {
      // Calculate days between now and deadline if exists
      let deadlineDays = 5; // Default 5 days
      if (document.deadline) {
        const deadlineDate = new Date(document.deadline);
        const today = new Date();
        const diffTime = Math.abs(deadlineDate.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        deadlineDays = diffDays > 0 ? diffDays : 5;
      }
      
      return {
        documentNumber: document.documentNumber || "",
        documentTypeId: document.documentTypeId,
        originAreaId: document.originAreaId,
        currentAreaId: document.currentAreaId,
        status: document.status || "Pending",
        subject: document.subject || "",
        deadlineDays: deadlineDays,
        filePath: document.filePath || "",
      };
    }

    // Verifica se existem áreas carregadas e define valores padrão
    const firstAreaId = areas && areas.length > 0 ? areas[0].id : undefined;
    const firstDocTypeId = docTypes && docTypes.length > 0 ? docTypes[0].id : undefined;

    return {
      documentNumber: "",
      documentTypeId: firstDocTypeId,
      originAreaId: firstAreaId,
      currentAreaId: firstAreaId,
      subject: "",
      status: "Pending",
      deadlineDays: 5,
      filePath: "",
    };
  };

  // Form setup with effect to update form when data loads
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: getDefaultValues(),
  });
  
  // Effect to update form values when areas or document types load
  useEffect(() => {
    if (!isLoadingAreas && !isLoadingDocTypes) {
      // Reset form with updated default values after data is loaded
      form.reset(getDefaultValues());
    }
  }, [isLoadingAreas, isLoadingDocTypes, areas, docTypes]);

  // Mutation for creating or updating documents
  const mutation = useMutation({
    mutationFn: async (values: DocumentFormValues) => {
      // Generate a tracking number for new documents
      const trackingNumber = !editMode
        ? `TRK-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0")}`
        : "";
            
      // Calculate deadline date based on deadlineDays if provided
      let deadline = null;
      if (values.deadlineDays !== undefined && values.deadlineDays !== null) {
        const deadlineDate = addDays(new Date(), values.deadlineDays);
        deadline = deadlineDate.toISOString();
      }
      
      const payload = {
        ...values,
        ...(deadline ? { deadline } : {}),
        createdBy: user?.id || 1, // Usa o ID do usuário logado
        documentTypeId: Number(values.documentTypeId),
        originAreaId: Number(values.originAreaId),
        currentAreaId: Number(values.currentAreaId),
        ...(trackingNumber ? { trackingNumber } : {}),
        folios: 1, // Valor padrão para folios
      };
      
      // Remove deadlineDays from the payload as it's not in the schema
      if ('deadlineDays' in payload) {
        delete (payload as any).deadlineDays;
      }

      if (editMode && documentId) {
        const res = await apiRequest("PUT", `/api/documents/${documentId}`, payload);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/documents", payload);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: `Documento ${editMode ? "atualizado" : "cadastrado"} com sucesso`,
        description: `O documento foi ${
          editMode ? "atualizado" : "cadastrado"
        } com sucesso.`,
      });
      onClose();
      form.reset(getDefaultValues());
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao ${editMode ? "atualizar" : "cadastrar"} o documento. ${error}`,
        variant: "destructive",
      });
    },
  });

  // Function to handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  // Handle form submission
  const onSubmit = (values: DocumentFormValues) => {
    // Create FormData for file upload
    const formData = new FormData();
    
    // Append file if selected
    if (selectedFile) {
      formData.append("file", selectedFile);
      
      // Upload file first
      fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      })
        .then(response => response.json())
        .then(data => {
          // If file upload successful, add the file path to the document data
          const valuesWithFile = {
            ...values,
            filePath: data.filePath
          };
          mutation.mutate(valuesWithFile);
        })
        .catch(error => {
          console.error("Error uploading file:", error);
          toast({
            title: "Erro ao enviar arquivo",
            description: "Ocorreu um erro ao enviar o arquivo. Por favor, tente novamente.",
            variant: "destructive",
          });
        });
    } else {
      // If no file, just submit the form data
      mutation.mutate(values);
    }
  };

  // Loading state
  const isLoading = isLoadingAreas || isLoadingDocTypes || (editMode && isLoadingDocument);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editMode ? "Editar Documento" : "Cadastrar Novo Documento"}</DialogTitle>
          <DialogDescription>
            Preencha os dados do documento para {editMode ? "atualizar" : "cadastrar"}.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Carregando...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Coluna da Esquerda */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="documentNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número do Documento</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Digite o número do documento" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="documentTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Documento</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          defaultValue={field.value?.toString()}
                          disabled={!docTypes?.length}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de documento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {docTypes?.length ? docTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id.toString()}>
                                {type.name}
                              </SelectItem>
                            )) : (
                              <SelectItem value="0" disabled>Nenhum tipo de documento encontrado</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {!docTypes?.length && (
                          <p className="text-sm text-red-500 mt-1">
                            É necessário criar tipos de documentos primeiro
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assunto</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Digite o assunto do documento"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Coluna da Direita */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="originAreaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área de Origem</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          defaultValue={field.value?.toString()}
                          disabled={!areas?.length}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a área de origem" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {areas?.length ? areas.map((area) => (
                              <SelectItem key={area.id} value={area.id.toString()}>
                                {area.name}
                              </SelectItem>
                            )) : (
                              <SelectItem value="0" disabled>Nenhuma área encontrada</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {!areas?.length && (
                          <p className="text-sm text-red-500 mt-1">
                            É necessário criar áreas primeiro
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentAreaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área de Destino</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          defaultValue={field.value?.toString()}
                          disabled={!areas?.length}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a área de destino" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {areas?.length ? areas.map((area) => (
                              <SelectItem key={area.id} value={area.id.toString()}>
                                {area.name}
                              </SelectItem>
                            )) : (
                              <SelectItem value="0" disabled>Nenhuma área encontrada</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {!areas?.length && (
                          <p className="text-sm text-red-500 mt-1">
                            É necessário criar áreas primeiro
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deadlineDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prazo em Dias</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={1}
                            placeholder="Prazo em dias"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Vencimento: {format(addDays(new Date(), field.value || 0), "dd/MM/yyyy", { locale: ptBR })}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* File Upload Field */}
                  <div className="mt-4">
                    <FormLabel>Anexo</FormLabel>
                    <div className="mt-2">
                      <Input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                      <FormDescription className="mt-1">
                        Formatos aceitos: PDF, DOC, DOCX, JPG, PNG (máx. 10MB)
                      </FormDescription>
                    </div>
                    {selectedFile && (
                      <div className="mt-2 text-sm text-green-600">
                        Arquivo selecionado: {selectedFile.name}
                      </div>
                    )}
                  </div>
                </div>
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
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Salvando..." : editMode ? "Atualizar" : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}