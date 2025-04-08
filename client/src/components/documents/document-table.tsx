import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Document, Area, DocumentType } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Activity, Paperclip, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import TrackingModal from "./tracking-modal";
import { Badge } from "@/components/ui/badge";

interface DocumentTableProps {
  status?: string;
  areaId?: number;
}

export default function DocumentTable({ status, areaId }: DocumentTableProps) {
  const [_, setLocation] = useLocation();
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);

  // Fetch documents
  const { data: documents, isLoading: isLoadingDocuments } = useQuery<Document[]>({
    queryKey: status
      ? [`/api/documents/status/${status}`]
      : areaId
      ? [`/api/documents/area/${areaId}`]
      : ["/api/documents"],
  });

  // Fetch areas for displaying area names
  const { data: areas, isLoading: isLoadingAreas } = useQuery<Area[]>({
    queryKey: ["/api/areas"],
  });

  // Fetch document types for displaying type names
  const { data: docTypes, isLoading: isLoadingDocTypes } = useQuery<DocumentType[]>({
    queryKey: ["/api/document-types"],
  });

  // Get area name by ID
  const getAreaName = (areaId: number) => {
    const area = areas?.find((a) => a.id === areaId);
    return area ? area.name : `Area ${areaId}`;
  };

  // Get document type name by ID
  const getDocTypeName = (typeId: number) => {
    const docType = docTypes?.find((t) => t.id === typeId);
    return docType ? docType.name : `Type ${typeId}`;
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "approved":
      case "concluído":
      case "aprovado":
        return "bg-green-100 text-green-800";
      case "in review":
      case "in progress":
      case "em revisão":
      case "em progresso":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
      case "pendente":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº Protocolo</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Remetente</TableHead>
              <TableHead>Localização Atual</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingDocuments || isLoadingAreas || isLoadingDocTypes ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : documents && documents.length > 0 ? (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.trackingNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <svg
                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span>{getDocTypeName(doc.documentTypeId)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{`${doc.senderName} ${doc.senderLastName}`}</TableCell>
                  <TableCell>{getAreaName(doc.currentAreaId)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusBadgeColor(doc.status)}
                    >
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {doc.deadline ? format(new Date(doc.deadline), "dd/MM/yyyy", { locale: ptBR }) : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/documents/${doc.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDocumentId(doc.id)}
                      >
                        <Activity className="h-4 w-4 mr-1" />
                        Histórico
                      </Button>
                      {doc.filePath ? (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={doc.filePath} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-1" />
                            Anexo
                          </a>
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                  Nenhum documento encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Tracking Modal */}
      {selectedDocumentId && (
        <TrackingModal
          documentId={selectedDocumentId}
          isOpen={!!selectedDocumentId}
          onClose={() => setSelectedDocumentId(null)}
        />
      )}
    </>
  );
}
