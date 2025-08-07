import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Document } from "@shared/schema";
import { Eye, FileText, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLocation } from "wouter";

export default function AssignedDocuments() {
  const [, setLocation] = useLocation();
  
  const { data: assignedDocuments = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents/assigned"],
  });

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "Urgente":
        return "bg-red-100 text-red-800 border-red-300";
      case "Com Contagem de Prazo":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "Normal":
      default:
        return "bg-green-100 text-green-800 border-green-300";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Pending":
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documentos Atribuídos a Mim</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <p>Carregando documentos atribuídos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assignedDocuments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documentos Atribuídos a Mim</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">Nenhum documento atribuído a você no momento.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Documentos Atribuídos a Mim ({assignedDocuments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignedDocuments.map((doc) => (
            <div
              key={doc.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{doc.documentNumber}</h3>
                    <Badge variant="outline" className={getPriorityBadgeColor(doc.priority || "Normal")}>
                      {doc.priority || "Normal"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Código: {doc.trackingNumber}
                  </p>
                </div>
                <Badge variant="outline" className={getStatusBadgeColor(doc.status)}>
                  {doc.status}
                </Badge>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium mb-1">Assunto:</p>
                <p className="text-sm text-muted-foreground">{doc.subject}</p>
              </div>

              {doc.deadline && (
                <div className="mb-3">
                  <p className="text-sm font-medium mb-1">Prazo:</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(doc.deadline), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation(`/documents/${doc.id}`)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver Detalhes
                </Button>
                
                {doc.filePath && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a 
                      href={`/api/files/${doc.filePath.split('/').pop()}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Ver Anexo
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}