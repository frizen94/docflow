
import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DocumentAttachment } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Paperclip,
  Eye
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DocumentAttachmentsProps {
  documentId: number;
}

export default function DocumentAttachments({ documentId }: DocumentAttachmentsProps) {
  const { toast } = useToast();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<string>("Anexo");
  const [uploadDescription, setUploadDescription] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Buscar anexos do documento
  const { data: attachments = [], isLoading } = useQuery<DocumentAttachment[]>({
    queryKey: [`/api/documents/${documentId}/attachments`],
  });

  // Mutation para upload de anexo
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/documents/${documentId}/attachments`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao enviar anexo");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}/attachments`] });
      toast({
        title: "Anexo enviado",
        description: "O anexo foi enviado com sucesso.",
      });
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadDescription("");
      setUploadCategory("Anexo");
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar anexo",
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar anexo
  const deleteMutation = useMutation({
    mutationFn: async (attachmentId: number) => {
      const response = await apiRequest("DELETE", `/api/attachments/${attachmentId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}/attachments`] });
      toast({
        title: "Anexo removido",
        description: "O anexo foi removido com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao remover anexo",
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

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para upload",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("category", uploadCategory);
    formData.append("description", uploadDescription);
    formData.append("version", "1.0");

    uploadMutation.mutate(formData);
  };

  const handleDownload = (attachment: DocumentAttachment) => {
    window.open(`/api/attachments/${attachment.id}/download`, '_blank');
  };

  const handleDelete = (attachmentId: number) => {
    if (confirm("Tem certeza que deseja remover este anexo?")) {
      deleteMutation.mutate(attachmentId);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Principal": return <FileText className="h-4 w-4 text-blue-600" />;
      case "Anexo": return <Paperclip className="h-4 w-4 text-green-600" />;
      case "Resposta": return <FileText className="h-4 w-4 text-purple-600" />;
      case "Petição": return <FileText className="h-4 w-4 text-red-600" />;
      case "Despacho": return <FileText className="h-4 w-4 text-orange-600" />;
      case "Decisão": return <FileText className="h-4 w-4 text-indigo-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Anexos ({attachments.length})
        </h3>
        <Button onClick={() => setShowUploadModal(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Adicionar Anexo
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Carregando anexos...</p>
        </div>
      ) : attachments.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">Nenhum anexo encontrado</p>
          <p className="text-sm text-gray-400">Adicione anexos para instruir o processo</p>
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div 
              key={attachment.id} 
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                {getCategoryIcon(attachment.category)}
                <div className="flex-1">
                  <p className="font-medium text-sm">{attachment.originalName}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Badge variant="outline" className="text-xs">
                      {attachment.category}
                    </Badge>
                    <span>{formatFileSize(attachment.fileSize)}</span>
                    <span>•</span>
                    <span>{format(new Date(attachment.uploadedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                  </div>
                  {attachment.description && (
                    <p className="text-xs text-gray-600 mt-1">{attachment.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(attachment)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(attachment.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Anexo</DialogTitle>
            <DialogDescription>
              Selecione um arquivo para anexar ao processo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Arquivo</Label>
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
              />
              {selectedFile && (
                <p className="text-sm text-green-600 mt-1">
                  Arquivo selecionado: {selectedFile.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Principal">Documento Principal</SelectItem>
                  <SelectItem value="Anexo">Anexo</SelectItem>
                  <SelectItem value="Resposta">Resposta</SelectItem>
                  <SelectItem value="Petição">Petição</SelectItem>
                  <SelectItem value="Despacho">Despacho</SelectItem>
                  <SelectItem value="Decisão">Decisão</SelectItem>
                  <SelectItem value="Complemento">Complemento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea
                id="description"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Descreva o conteúdo do anexo..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "Enviando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
