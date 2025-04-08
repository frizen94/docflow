import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertDocumentSchema } from "@shared/schema";
import { Area, DocumentType, Document } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Paperclip, Upload } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format, addDays } from "date-fns";

// Extended schema for form validation
const documentFormSchema = insertDocumentSchema
  .extend({
    deadlineDays: z.number().int().min(1, {
      message: "O prazo deve ser de pelo menos 1 dia",
    }).optional(),
    // Garantir que campos opcionais sejam strings vazias em vez de null/undefined
    filePath: z.string().optional().transform(val => val || ''),
  })
  .omit({ trackingNumber: true, deadline: true });

type DocumentFormValues = z.infer<typeof documentFormSchema>;

interface DocumentFormProps {
  editMode?: boolean;
  documentId?: number;
}

export default function DocumentForm({ editMode = false, documentId }: DocumentFormProps) {
  // Removed representation type state
  const [_, setLocation] = useLocation();
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
        folios: document.folios || 1,
        deadlineDays: deadlineDays,
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
      folios: 1,
      deadlineDays: 5,
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

  // Removed sender auto-fill effect

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
      setLocation("/documents");
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao ${editMode ? "atualizar" : "cadastrar"} o documento. ${error}`,
        variant: "destructive",
      });
    },
  });

  // Removed employee search function

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

  // Removed representation type watch
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna da Esquerda - Informações do Documento */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Informações do Documento</CardTitle>
              </CardHeader>
              <CardContent>
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
                        disabled={isLoadingDocTypes || !docTypes?.length}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingDocTypes ? "Carregando..." : "Selecione o tipo de documento"} />
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
                      {!docTypes?.length && !isLoadingDocTypes && (
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
                  name="originAreaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área de Origem</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={field.value?.toString()}
                        disabled={isLoadingAreas || !areas?.length}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingAreas ? "Carregando..." : "Selecione a área de origem"} />
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
                      {!areas?.length && !isLoadingAreas && (
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
                        disabled={isLoadingAreas || !areas?.length}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingAreas ? "Carregando..." : "Selecione a área de destino"} />
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
                      {!areas?.length && !isLoadingAreas && (
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

                <FormField
                  control={form.control}
                  name="folios"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Folhas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Número de folhas do documento"
                          {...field}
                          value={field.value || 1}
                          onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                        />
                      </FormControl>
                      <FormDescription>
                        Informe o número de folhas físicas do documento
                      </FormDescription>
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
                          placeholder="Digite o número de dias para o prazo"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Data final calculada: {format(addDays(new Date(), field.value || 0), "dd/MM/yyyy")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* File Upload Control */}
                <div className="mt-4">
                  <FormLabel>Anexo</FormLabel>
                  <div className="border border-gray-200 rounded-md p-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full flex items-center justify-center"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Paperclip className="mr-2 h-4 w-4" />
                            Selecionar Arquivo
                          </Button>
                          {selectedFile && (
                            <div className="text-sm text-gray-600 truncate max-w-[200px]">
                              {selectedFile.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Tipos de arquivo suportados: PDF, DOC, DOCX, JPG, PNG (máx. 10MB)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            className="bg-primary text-white hover:bg-primary/90 text-lg font-semibold px-10 py-6 rounded-md"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Salvando..." : editMode ? "Atualizar Documento" : "Cadastrar Documento"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
