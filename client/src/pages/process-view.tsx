import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Document, DocumentAttachment, DocumentTracking } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Download, 
  Calendar, 
  User, 
  Building, 
  Clock,
  Eye,
  ChevronDown,
  ChevronRight,
  Paperclip,
  ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProcessViewProps {}

export default function ProcessView({}: ProcessViewProps) {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [selectedAttachment, setSelectedAttachment] = useState<DocumentAttachment | null>(null);
  const [expandedTrackings, setExpandedTrackings] = useState<Set<number>>(new Set());

  const handleGoBack = () => {
    setLocation(`/documents/${id}`);
  };

  // Buscar dados do documento
  const { data: document, isLoading: loadingDocument } = useQuery({
    queryKey: ["document", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/documents/${id}`);
      return res.json() as Promise<Document>;
    },
  });

  // Buscar anexos do documento
  const { data: attachments = [], isLoading: loadingAttachments } = useQuery({
    queryKey: ["attachments", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/documents/${id}/attachments`);
      return res.json() as Promise<DocumentAttachment[]>;
    },
    enabled: !!id,
  });

  // Buscar histórico de tramitação
  const { data: trackings = [], isLoading: loadingTrackings } = useQuery({
    queryKey: ["trackings", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/document-tracking/document/${id}`);
      return res.json() as Promise<DocumentTracking[]>;
    },
    enabled: !!id,
  });

  const toggleTracking = (trackingId: number) => {
    const newExpanded = new Set(expandedTrackings);
    if (newExpanded.has(trackingId)) {
      newExpanded.delete(trackingId);
    } else {
      newExpanded.add(trackingId);
    }
    setExpandedTrackings(newExpanded);
  };

  const handleDownload = async (attachmentId: number) => {
    try {
      const response = await apiRequest("GET", `/api/attachments/${attachmentId}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = window.document.createElement('a');
      anchor.style.display = 'none';
      anchor.href = url;
      anchor.download = selectedAttachment?.originalName || 'download';
      window.document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(anchor);
    } catch (error) {
      console.error('Erro ao fazer download:', error);
    }
  };

  const handleViewAttachment = (attachment: DocumentAttachment) => {
    setSelectedAttachment(attachment);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Em Análise": return "bg-blue-100 text-blue-800";
      case "In Progress": return "bg-orange-100 text-orange-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "Archived": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Principal": return <FileText className="h-4 w-4 text-blue-600" />;
      case "Anexo": return <Paperclip className="h-4 w-4 text-green-600" />;
      case "Resposta": return <FileText className="h-4 w-4 text-purple-600" />;
      case "Petição": return <FileText className="h-4 w-4 text-red-600" />;
      case "Despacho": return <FileText className="h-4 w-4 text-orange-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loadingDocument || loadingAttachments || loadingTrackings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Carregando processo...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Processo não encontrado</h2>
          <p className="mt-2 text-gray-600">O processo solicitado não existe ou você não tem permissão para visualizá-lo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho do Processo */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGoBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar aos Detalhes</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Processo {document.documentNumber}
                </h1>
                <p className="text-sm text-gray-500">
                  Código de Rastreamento: {document.trackingNumber}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(document.status)}>
              {document.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda - Informações e Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações do Processo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informações do Processo
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Assunto</p>
                  <p className="text-sm text-gray-900">{document.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo</p>
                  <p className="text-sm text-gray-900">{document.documentTypeId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Prioridade</p>
                  <p className="text-sm text-gray-900">{document.priority}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Folhas</p>
                  <p className="text-sm text-gray-900">{document.folios}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Data de Criação</p>
                  <p className="text-sm text-gray-900">
                    {format(new Date(document.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                {document.deadline && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Prazo</p>
                    <p className="text-sm text-gray-900">
                      {format(new Date(document.deadline), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline de Tramitação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Histórico de Tramitação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trackings.map((tracking, index) => (
                    <div key={tracking.id} className="relative">
                      {index !== trackings.length - 1 && (
                        <div className="absolute left-4 top-8 w-0.5 h-16 bg-gray-200"></div>
                      )}
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">
                              Movimentação para {tracking.toAreaId}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {format(new Date(tracking.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                          {tracking.description && (
                            <p className="text-sm text-gray-600 mt-1">{tracking.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Lista de Anexos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paperclip className="h-5 w-5" />
                  Documentos Anexados ({attachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAttachment?.id === attachment.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleViewAttachment(attachment)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(attachment.category)}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {attachment.originalName}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>Categoria: {attachment.category}</span>
                              <span>•</span>
                              <span>Versão: {attachment.version}</span>
                              <span>•</span>
                              <span>{(attachment.fileSize / 1024).toFixed(1)} KB</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewAttachment(attachment);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(attachment.id);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {attachment.description && (
                        <p className="text-xs text-gray-600 mt-2">{attachment.description}</p>
                      )}
                    </div>
                  ))}
                  {attachments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Paperclip className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Nenhum documento anexado</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita - Visualizador de Documento */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Visualizador de Documento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedAttachment ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">
                        {selectedAttachment.originalName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Categoria: {selectedAttachment.category} | 
                        Versão: {selectedAttachment.version}
                      </p>
                    </div>
                    
                    {/* Visualizador de PDF */}
                    {selectedAttachment.mimeType === 'application/pdf' ? (
                      <div className="border rounded-lg overflow-hidden">
                        <iframe
                          src={`/api/attachments/${selectedAttachment.id}/download`}
                          className="w-full h-96"
                          title={selectedAttachment.originalName}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 border rounded-lg">
                        <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">
                          Visualização não disponível para este tipo de arquivo
                        </p>
                        <Button
                          className="mt-2"
                          size="sm"
                          onClick={() => handleDownload(selectedAttachment.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Baixar Arquivo
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Eye className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Selecione um documento para visualizar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
