import { useQuery, useMutation } from "@tanstack/react-query";
import { Document, DocumentTracking, Area, DocumentType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, User, Building, CornerDownRight, Clipboard, SendIcon, HistoryIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DocumentForm from "@/components/documents/document-form";
import TrackingModal from "@/components/documents/tracking-modal";
import DocumentForwardModal from "@/components/documents/document-forward-modal";
import DocumentTrackingHistory from "@/components/documents/document-tracking-history";

// Schema for tracking form
const trackingFormSchema = z.object({
  toAreaId: z.number({
    required_error: "Please select a destination area",
  }),
  description: z.string().optional(),
});

type TrackingFormValues = z.infer<typeof trackingFormSchema>;

interface DocumentDetailsProps {
  id: number;
}

export default function DocumentDetails({ id }: DocumentDetailsProps) {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);

  // Fetch document data
  const { data: document, isLoading: isLoadingDocument } = useQuery<Document>({
    queryKey: [`/api/documents/${id}`],
  });

  // Fetch areas for dropdown
  const { data: areas } = useQuery<Area[]>({
    queryKey: ["/api/areas"],
  });

  // Fetch document types for displaying type name
  const { data: docTypes } = useQuery<DocumentType[]>({
    queryKey: ["/api/document-types"],
  });

  // Get document type name
  const getDocTypeName = (typeId: number): string => {
    const docType = docTypes?.find(dt => dt.id === typeId);
    return docType ? docType.name : `Type ${typeId}`;
  };

  // Get area name
  const getAreaName = (areaId: number): string => {
    const area = areas?.find(a => a.id === areaId);
    return area ? area.name : `Area ${areaId}`;
  };

  // Form setup for tracking
  const form = useForm<TrackingFormValues>({
    resolver: zodResolver(trackingFormSchema),
    defaultValues: {
      toAreaId: 0,
      description: "",
    },
  });

  // Mutation for creating tracking entry
  const trackingMutation = useMutation({
    mutationFn: async (values: TrackingFormValues) => {
      if (!document) throw new Error("Document not found");
      
      const trackingData = {
        documentId: document.id,
        fromAreaId: document.currentAreaId,
        toAreaId: values.toAreaId,
        description: values.description || "",
        attachmentPath: "",
        createdBy: 1, // Default to first user
      };
      
      const res = await apiRequest("POST", "/api/document-tracking", trackingData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Document transferred",
        description: "The document has been successfully transferred to the selected area.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to transfer document: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Complete document mutation
  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!document) throw new Error("Document not found");
      
      const res = await apiRequest("PUT", `/api/documents/${document.id}`, {
        ...document,
        status: "Completed",
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Document completed",
        description: "The document has been marked as completed.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to complete document: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Handle tracking form submission
  const onSubmit = (values: TrackingFormValues) => {
    trackingMutation.mutate(values);
  };

  // Handle document completion
  const handleCompleteDocument = () => {
    completeMutation.mutate();
  };

  if (showEditForm && document) {
    return <DocumentForm editMode={true} documentId={document.id} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setLocation("/documents")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar para Documentos
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          Detalhes do Documento
          {document && (
            <span className="ml-2 text-gray-500 font-normal text-lg">
              {document.trackingNumber}
            </span>
          )}
        </h1>
      </div>

      {isLoadingDocument ? (
        // Loading skeleton
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : document ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Document Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Document Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Document Type</p>
                      <p className="mt-1">{getDocTypeName(document.documentTypeId)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Document Number</p>
                      <p className="mt-1">{document.documentNumber}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Subject</p>
                    <p className="mt-1">{document.subject}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Origin Area</p>
                      <p className="mt-1">{getAreaName(document.originAreaId)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Current Area</p>
                      <p className="mt-1">{getAreaName(document.currentAreaId)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Folios</p>
                      <p className="mt-1">{document.folios}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <Badge
                        variant="outline"
                        className={
                          document.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : document.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {document.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created At</p>
                      <p className="mt-1">{format(new Date(document.createdAt), "MMM dd, yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Deadline</p>
                      <p className="mt-1">
                        {document.deadline
                          ? format(new Date(document.deadline), "MMM dd, yyyy")
                          : "No deadline"}
                      </p>
                    </div>
                  </div>
                  
                  {document.filePath && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Attachment</p>
                      <a
                        href={document.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-500 mt-1 inline-block"
                      >
                        View attachment
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sender Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Sender Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">DNI</p>
                      <p className="mt-1">{document.senderDni}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Full Name</p>
                      <p className="mt-1">{`${document.senderName} ${document.senderLastName}`}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="mt-1">{document.senderPhone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="mt-1">{document.senderEmail || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="mt-1">{document.senderAddress || "N/A"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Representation Type</p>
                    <p className="mt-1">{document.representation}</p>
                  </div>
                  
                  {document.representation === "Persona Jurídica" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">RUC</p>
                        <p className="mt-1">{document.companyRuc || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Company Name</p>
                        <p className="mt-1">{document.companyName || "N/A"}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CornerDownRight className="h-5 w-5 mr-2" />
                  Encaminhar Documento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="toAreaId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destination Area</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(Number(value))}
                            value={field.value ? field.value.toString() : undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select destination area" />
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
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Add description about this transfer..."
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={trackingMutation.isPending || document.status === "Completed"}
                    >
                      {trackingMutation.isPending ? "Transferring..." : "Transfer Document"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clipboard className="h-5 w-5 mr-2" />
                  Ações do Documento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center"
                    onClick={() => setShowForwardModal(true)}
                  >
                    <SendIcon className="h-4 w-4 mr-2" />
                    Encaminhar Documento
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center"
                    onClick={() => document && document.id && setShowTrackingModal(true)}
                  >
                    <HistoryIcon className="h-4 w-4 mr-2" />
                    Histórico de Tramitação
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowEditForm(true)}
                  >
                    Editar Documento
                  </Button>
                  
                  <Button
                    variant="default"
                    className="w-full"
                    disabled={document.status === "Completed" || completeMutation.isPending}
                    onClick={handleCompleteDocument}
                  >
                    {completeMutation.isPending ? "Processando..." : "Finalizar Documento"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Forward Modal */}
          {showForwardModal && document && (
            <DocumentForwardModal
              documentId={document.id}
              currentAreaId={document.currentAreaId}
              isOpen={showForwardModal}
              onClose={() => setShowForwardModal(false)}
            />
          )}

          {/* Tracking History Component */}
          <DocumentTrackingHistory documentId={document.id} />
        </>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">Document not found</p>
        </div>
      )}
    </div>
  );
}
