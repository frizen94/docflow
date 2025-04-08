import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DocumentTracking, Area, Employee } from "@shared/schema";

// Interface estendida para o tracking com objetos relacionados
interface TrackingWithRelations extends DocumentTracking {
  fromArea?: Area;
  toArea?: Area;
  toEmployee?: Employee;
  status: string;
  deadlineDate?: string;
}
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

interface DocumentTrackingHistoryProps {
  documentId: number;
}

export default function DocumentTrackingHistory({
  documentId,
}: DocumentTrackingHistoryProps) {
  const { data: trackingHistory = [], isLoading } = useQuery<TrackingWithRelations[]>({
    queryKey: [`/api/document-tracking/document/${documentId}`],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Encaminhamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <p>Carregando histórico...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trackingHistory || trackingHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Encaminhamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <p>Nenhum registro de encaminhamento encontrado.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pendente":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            Pendente
          </Badge>
        );
      case "Finalizado":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Finalizado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Encaminhamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>De</TableHead>
              <TableHead>Para</TableHead>
              <TableHead>Funcionário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Descrição</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trackingHistory.map((tracking) => {
              // Simulamos os dados que viriam do backend com joins
              const status = tracking.deadlineDays ? "Pendente" : "Finalizado";
              // Em um backend real, estas propriedades já viriam preenchidas com joins
              
              return (
                <TableRow key={tracking.id}>
                  <TableCell>{formatDate(tracking.createdAt)}</TableCell>
                  <TableCell>
                    {/* Área de origem - em produção viria do join */}
                    Área {tracking.fromAreaId}
                  </TableCell>
                  <TableCell className="flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 text-gray-500" />
                    {/* Área de destino - em produção viria do join */}
                    Área {tracking.toAreaId}
                  </TableCell>
                  <TableCell>
                    {tracking.toEmployeeId 
                      ? `Funcionário ${tracking.toEmployeeId}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(status)}
                  </TableCell>
                  <TableCell>
                    {tracking.deadlineDays 
                      ? "Em processamento"
                      : "-"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {tracking.description || "-"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}