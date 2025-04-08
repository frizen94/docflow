import { useQuery } from "@tanstack/react-query";
import { DocumentTracking, Document, Area } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList } from "lucide-react";

interface TrackingModalProps {
  documentId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function TrackingModal({ documentId, isOpen, onClose }: TrackingModalProps) {
  // Fetch document info
  const { data: document, isLoading: isLoadingDocument } = useQuery<Document>({
    queryKey: [`/api/documents/${documentId}`],
    enabled: isOpen,
  });

  // Fetch tracking entries
  const { data: trackingEntries, isLoading: isLoadingTracking } = useQuery<DocumentTracking[]>({
    queryKey: [`/api/document-tracking/document/${documentId}`],
    enabled: isOpen,
  });

  // Fetch areas for displaying area names
  const { data: areas } = useQuery<Area[]>({
    queryKey: ["/api/areas"],
    enabled: isOpen,
  });

  // Get area name by ID
  const getAreaName = (areaId: number) => {
    const area = areas?.find((a) => a.id === areaId);
    return area ? area.name : `Area ${areaId}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center">
            <div className="mr-3 flex-shrink-0 bg-primary-100 rounded-full p-2">
              <ClipboardList className="h-6 w-6 text-primary-600" />
            </div>
            <DialogTitle className="text-lg leading-6 font-medium">
              Rastreamento do Documento: {document?.trackingNumber || "Carregando..."}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="mt-6">
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {isLoadingTracking ? (
                // Skeleton loading state
                Array.from({ length: 3 }).map((_, index) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      {index < 2 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <Skeleton className="h-4 w-64 mb-2" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                          <div className="text-right">
                            <Skeleton className="h-3 w-20 mb-1" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : trackingEntries && trackingEntries.length > 0 ? (
                trackingEntries.map((entry, index) => (
                  <li key={entry.id}>
                    <div className="relative pb-8">
                      {index < trackingEntries.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              index === 0
                                ? "bg-green-500"
                                : index === trackingEntries.length - 1
                                ? "bg-green-500"
                                : "bg-blue-500"
                            }`}
                          >
                            <svg
                              className="h-5 w-5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              {index === 0 ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                              ) : index === trackingEntries.length - 1 ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              ) : (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              )}
                            </svg>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Documento
                              <span className="font-medium text-gray-900 ml-1">
                                {index === 0
                                  ? "criado"
                                  : index === trackingEntries.length - 1
                                  ? "concluído"
                                  : "transferido"}
                              </span>
                              {index === 0 ? (
                                <span className="ml-1">
                                  em {getAreaName(entry.fromAreaId)}
                                </span>
                              ) : (
                                <span className="ml-1">
                                  de {getAreaName(entry.fromAreaId)} para{" "}
                                  {getAreaName(entry.toAreaId)}
                                </span>
                              )}
                            </p>
                            {entry.description && (
                              <p className="mt-1 text-sm text-gray-500">{entry.description}</p>
                            )}
                            {entry.attachmentPath && (
                              <p className="mt-1 text-sm text-blue-500">
                                <a
                                  href={entry.attachmentPath}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  Ver anexo
                                </a>
                              </p>
                            )}
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time dateTime={new Date(entry.createdAt).toISOString()}>
                              {format(new Date(entry.createdAt), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                            </time>
                            <br />
                            <time dateTime={new Date(entry.createdAt).toISOString()}>
                              {format(new Date(entry.createdAt), "HH:mm", { locale: ptBR })}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="py-4 text-center text-gray-500">Nenhum registro de rastreamento encontrado</li>
              )}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
