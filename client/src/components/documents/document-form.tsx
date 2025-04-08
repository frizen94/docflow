import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertDocumentSchema } from "@shared/schema";
import { Area, DocumentType, Document } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
    confirmCheck: z.boolean().refine((val) => val === true, {
      message: "You must confirm the information is correct",
    }),
  })
  .omit({ trackingNumber: true });

type DocumentFormValues = z.infer<typeof documentFormSchema>;

interface DocumentFormProps {
  editMode?: boolean;
  documentId?: number;
}

export default function DocumentForm({ editMode = false, documentId }: DocumentFormProps) {
  const [representationType, setRepresentationType] = useState("A Nombre Propio");
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch areas for select
  const { data: areas } = useQuery<Area[]>({
    queryKey: ["/api/areas"],
  });

  // Fetch document types for select
  const { data: docTypes } = useQuery<DocumentType[]>({
    queryKey: ["/api/document-types"],
  });

  // Fetch document data if in edit mode
  const { data: document, isLoading: isLoadingDocument } = useQuery<Document>({
    queryKey: editMode && documentId ? [`/api/documents/${documentId}`] : null,
    enabled: editMode && !!documentId,
  });

  // Generate default values for form
  const getDefaultValues = (): Partial<DocumentFormValues> => {
    if (editMode && document) {
      return {
        documentNumber: document.documentNumber,
        documentTypeId: document.documentTypeId,
        senderDni: document.senderDni,
        senderName: document.senderName,
        senderLastName: document.senderLastName,
        senderEmail: document.senderEmail || "",
        senderPhone: document.senderPhone || "",
        senderAddress: document.senderAddress || "",
        representation: document.representation,
        companyRuc: document.companyRuc || "",
        companyName: document.companyName || "",
        originAreaId: document.originAreaId,
        currentAreaId: document.currentAreaId,
        status: document.status,
        subject: document.subject,
        folios: document.folios,
        deadline: document.deadline
          ? format(new Date(document.deadline), "yyyy-MM-dd")
          : "",
        confirmCheck: true,
      };
    }

    return {
      documentNumber: "",
      senderDni: "",
      senderName: "",
      senderLastName: "",
      senderEmail: "",
      senderPhone: "",
      senderAddress: "",
      representation: "A Nombre Propio",
      subject: "",
      folios: 1,
      status: "Pending",
      confirmCheck: false,
    };
  };

  // Form setup
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: getDefaultValues(),
  });

  // Mutation for creating or updating documents
  const mutation = useMutation({
    mutationFn: async (values: DocumentFormValues) => {
      // Generate a tracking number for new documents
      const trackingNumber = !editMode
        ? `TRK-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0")}`
        : "";

      const payload = {
        ...values,
        ...(values.deadline
          ? { deadline: new Date(values.deadline).toISOString() }
          : {}),
        createdBy: 1, // Default to first user
        folios: Number(values.folios),
        documentTypeId: Number(values.documentTypeId),
        originAreaId: Number(values.originAreaId),
        currentAreaId: Number(values.currentAreaId),
        ...(trackingNumber ? { trackingNumber } : {}),
      };

      delete payload.confirmCheck;

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
        title: `Document ${editMode ? "updated" : "created"} successfully`,
        description: `The document has been ${
          editMode ? "updated" : "created"
        } successfully.`,
      });
      setLocation("/documents");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${editMode ? "update" : "create"} document. ${error}`,
        variant: "destructive",
      });
    },
  });

  // Function to search employee by DNI
  const searchEmployeeByDni = async (dni: string) => {
    if (!dni || dni.length < 8) return;

    try {
      const response = await fetch(`/api/employees/dni/${dni}`, {
        credentials: "include",
      });
      
      if (response.ok) {
        const employee = await response.json();
        form.setValue("senderName", employee.firstName);
        form.setValue("senderLastName", employee.lastName);
        if (employee.email) form.setValue("senderEmail", employee.email);
        if (employee.phone) form.setValue("senderPhone", employee.phone);
      }
    } catch (error) {
      console.error("Error searching for employee:", error);
    }
  };

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
            title: "Error uploading file",
            description: "There was an error uploading the file. Please try again.",
            variant: "destructive",
          });
        });
    } else {
      // If no file, just submit the form data
      mutation.mutate(values);
    }
  };

  // Watch representation type to show/hide company fields
  const watchRepresentation = form.watch("representation");
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Document Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Documento</CardTitle>
            </CardHeader>
            <CardContent>
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
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a área de origem" />
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

                <FormField
                  control={form.control}
                  name="currentAreaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área de Destino</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={field.value?.toString()}
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

                <FormField
                  control={form.control}
                  name="documentTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Documento</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de documento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {docTypes?.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="folios"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Folhas</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={1}
                            placeholder="Digite o número de folhas"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prazo</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            min={format(new Date(), "yyyy-MM-dd")}
                            placeholder="Selecione a data de prazo"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="confirmCheck"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-6">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Declaro sob as penas da lei que todas as informações
                          fornecidas são corretas e verdadeiras.
                        </FormLabel>
                        <FormMessage />
                      </div>
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

        <div className="flex justify-center">
          <Button
            type="submit"
            className="bg-success-600 hover:bg-success-700 text-lg px-8 py-2"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Salvando..." : editMode ? "Atualizar Documento" : "Cadastrar Documento"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
