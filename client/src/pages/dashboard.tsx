import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileText, FileSignature, ClipboardCheck, Clock, Users, FileCheck2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, differenceInDays, startOfMonth, endOfMonth, getDate, getDay, addDays, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import RecentActivity from "@/components/dashboard/recent-activity";
import UpcomingDeadlines from "@/components/dashboard/upcoming-deadlines";
import AssignedDocuments from "@/components/documents/assigned-documents";
import { useAuth } from "@/hooks/use-auth";

interface DashboardStats {
  totalDocuments: number;
  completedDocuments: number;
  approachingDeadline: number;
  totalUsers: number;
}

interface DetailedStats {
  totalDocuments: number;
  pendingDocuments: number;
  urgentDocuments: number;
  inAnalysisDocuments: number;
  completedDocuments: number;
  documentsToAssign: number;
  upcomingDeadlines: number;
  upcomingDeadlinesList: Array<{
    id: number;
    documentNumber: string;
    subject: string;
    priority: string;
    deadline: string;
  }>;
  documentsByArea: Array<{
    areaName: string;
    count: number;
  }>;
  recentDocumentsCount: number;
  recentDocumentsList: Array<{
    id: number;
    documentNumber: string;
    subject: string;
    createdAt: string;
  }>;
}

interface CalendarEvents {
  [day: number]: Array<{
    id: number;
    documentNumber: string;
    subject: string;
    priority: string;
    deadline: string;
  }>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [visaoTipo, setVisaoTipo] = useState<"individual" | "setor" | "setor_e_subordinados">("individual");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });
  
  const { data: detailedStats, isLoading: isLoadingDetailed } = useQuery<DetailedStats>({
    queryKey: ["/api/dashboard/detailed-stats"],
  });
  
  const { data: calendarEvents } = useQuery<CalendarEvents>({
    queryKey: ["/api/dashboard/calendar", currentMonth.getFullYear(), currentMonth.getMonth() + 1],
  });
  
  const { data: analysisData } = useQuery({
    queryKey: ["/api/dashboard/analysis-by-time"],
  });
  
  // Meses em pt-BR
  const monthName = format(currentMonth, 'MMMM yyyy', { locale: ptBR });
  
  // Dados para o calendário
  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = [];
    const startDay = getDay(start);
    
    // Preencher dias vazios no início
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Preencher dias do mês
    for (let i = 1; i <= getDate(end); i++) {
      days.push(i);
    }
    
    return days;
  };
  
  const days = getDaysInMonth(currentMonth);
  
  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho e boas-vindas */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Seja bem-vindo(a), {user?.name}!
                  </h1>
                  <p className="text-gray-600 mt-1">
                    O sistema foi atualizado dia {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}, com uma nova versão 1.0.0. Sistema DocFlow operacional.
                  </p>
                </div>
                <button
                  onClick={() => setLocation("/documents/new")}
                  className="mt-4 md:mt-0 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Novo Documento
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="w-full md:w-80">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="mb-2">
                <h3 className="text-sm font-medium mb-2">Tipo de visão do painel</h3>
                <RadioGroup 
                  defaultValue="individual" 
                  value={visaoTipo}
                  onValueChange={(val) => setVisaoTipo(val as "individual" | "setor" | "setor_e_subordinados")}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual" className="cursor-pointer">Individual</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="setor" id="setor" />
                    <Label htmlFor="setor" className="cursor-pointer">Setor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="setor_e_subordinados" id="setor_e_subordinados" />
                    <Label htmlFor="setor_e_subordinados" className="cursor-pointer">Setor e subordinados</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Cards de Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard 
          title="Processos com prazo" 
          value={detailedStats?.upcomingDeadlines || 0} 
          icon={<Clock className="h-5 w-5 text-amber-500" />} 
          badgeColor="bg-amber-100 text-amber-500"
        />
        <StatusCard 
          title="Processos urgentes" 
          value={detailedStats?.urgentDocuments || 0} 
          icon={<FileText className="h-5 w-5 text-red-500" />} 
          badgeColor="bg-red-100 text-red-500"
        />
        <StatusCard 
          title="Processos em análise" 
          value={detailedStats?.inAnalysisDocuments || 0} 
          icon={<FileSignature className="h-5 w-5 text-green-500" />} 
          badgeColor="bg-green-100 text-green-500"
        />
        <StatusCard 
          title="Documentos para assinar" 
          value={detailedStats?.documentsToAssign || 0} 
          icon={<FileCheck2 className="h-5 w-5 text-blue-500" />} 
          badgeColor="bg-blue-100 text-blue-500"
        />
      </div>
      
      {/* Processos e Calendário */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Processos a vencer</CardTitle>
              <button 
                className="text-xs text-primary hover:underline" 
                onClick={() => setLocation("/documents?status=pendente")}
              >
                Ver todos
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex space-x-3 mb-4">
              <button 
                onClick={handlePrevMonth}
                className="text-gray-600 hover:text-gray-900"
              >
                &lt;
              </button>
              <h3 className="text-center flex-1 capitalize">{monthName}</h3>
              <button 
                onClick={handleNextMonth}
                className="text-gray-600 hover:text-gray-900"
              >
                &gt;
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              <div className="text-xs text-gray-500">Dom</div>
              <div className="text-xs text-gray-500">Seg</div>
              <div className="text-xs text-gray-500">Ter</div>
              <div className="text-xs text-gray-500">Qua</div>
              <div className="text-xs text-gray-500">Qui</div>
              <div className="text-xs text-gray-500">Sex</div>
              <div className="text-xs text-gray-500">Sáb</div>
              
              {days.map((day, index) => {
                const hasEvents = day && calendarEvents && calendarEvents[day] && calendarEvents[day].length > 0;
                const eventCount = hasEvents ? calendarEvents[day].length : 0;
                const today = new Date();
                const isToday = day === today.getDate() && 
                               currentMonth.getMonth() === today.getMonth() && 
                               currentMonth.getFullYear() === today.getFullYear();
                
                return (
                  <div key={index} className={`h-8 text-xs flex items-center justify-center relative ${
                    isToday ? 'bg-blue-100 rounded-full border border-blue-300 text-blue-700 font-medium' : ''
                  } ${
                    hasEvents ? 'bg-red-100 rounded-full border border-red-200 text-red-700' : ''
                  } ${
                    day === null ? 'opacity-0' : ''
                  } ${
                    day && !hasEvents && !isToday ? 'hover:bg-gray-50 cursor-pointer' : ''
                  }`}>
                    {day}
                    {hasEvents && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                        {eventCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="recebidas" className="w-full">
          <CardHeader className="pb-0">
            <div className="flex items-end justify-between">
              <CardTitle className="text-base font-medium">Assinaturas pendentes por tempo</CardTitle>
              <TabsList className="bg-gray-100">
                <TabsTrigger value="recebidas" className="text-xs px-2 py-1 h-6">RECEBIDAS</TabsTrigger>
                <TabsTrigger value="enviadas" className="text-xs px-2 py-1 h-6">ENVIADAS</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <TabsContent value="recebidas" className="m-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-xs font-medium text-left px-2 py-1">DOCUMENTO</th>
                      <th className="text-xs font-medium text-right px-2 py-1">DIAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailedStats?.upcomingDeadlinesList && detailedStats.upcomingDeadlinesList.length > 0 ? (
                      detailedStats.upcomingDeadlinesList.slice(0, 5).map((doc) => {
                        const deadline = new Date(doc.deadline);
                        const today = new Date();
                        const daysUntilDeadline = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        
                        return (
                          <tr 
                            key={doc.id} 
                            className="border-t cursor-pointer hover:bg-gray-50"
                            onClick={() => setLocation(`/documents/${doc.id}`)}
                          >
                            <td className="text-xs px-2 py-2 text-primary hover:underline">
                              {doc.documentNumber} - {doc.subject.substring(0, 30)}...
                            </td>
                            <td className="text-xs text-right px-2 py-2 font-medium">
                              <span className={`${daysUntilDeadline <= 1 ? 'text-red-600' : daysUntilDeadline <= 3 ? 'text-amber-600' : 'text-gray-600'}`}>
                                {daysUntilDeadline} dias
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr className="border-t">
                        <td className="text-xs px-2 py-2">Nenhum documento pendente</td>
                        <td className="text-xs text-right px-2 py-2">-</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="enviadas" className="m-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-xs font-medium text-left px-2 py-1">DOCUMENTO</th>
                      <th className="text-xs font-medium text-right px-2 py-1">DIAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="text-xs px-2 py-2">Nenhum documento enviado</td>
                      <td className="text-xs text-right px-2 py-2">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </div>
      
      {/* Análise de Processos e Mensagens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Processos em análise por tempo</CardTitle>
              <button 
                className="text-xs text-primary hover:underline" 
                onClick={() => setLocation("/documents?status=em_analise")}
              >
                Ver todos
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-xs font-medium text-left px-2 py-1">NUP</th>
                    <th className="text-xs font-medium text-right px-2 py-1">DIAS</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingDetailed ? (
                    Array(3).fill(0).map((_, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-2 py-2"><Skeleton className="h-4 w-32" /></td>
                        <td className="px-2 py-2 text-right"><Skeleton className="h-4 w-8 ml-auto" /></td>
                      </tr>
                    ))
                  ) : (analysisData && analysisData.length > 0) ? (
                    analysisData.slice(0, 5).map((doc: any) => (
                      <tr 
                        key={doc.id} 
                        className="border-t cursor-pointer hover:bg-gray-50"
                        onClick={() => setLocation(`/documents/${doc.id}`)}
                      >
                        <td className="text-xs px-2 py-2 text-primary hover:underline">
                          {doc.documentNumber} - {doc.subject.substring(0, 25)}...
                        </td>
                        <td className="text-xs text-right px-2 py-2 font-medium">
                          <span className={`${doc.daysInAnalysis > 30 ? 'text-red-600' : doc.daysInAnalysis > 15 ? 'text-amber-600' : 'text-gray-600'}`}>
                            {doc.daysInAnalysis} dias
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-t">
                      <td className="text-xs px-2 py-2">Nenhum processo em análise</td>
                      <td className="text-xs text-right px-2 py-2">-</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-medium">Mensagens</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-xs font-medium text-left px-2 py-1">MENSAGEM</th>
                    <th className="text-xs font-medium text-right px-2 py-1">DATA</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedStats?.recentDocumentsList && detailedStats.recentDocumentsList.length > 0 ? (
                    detailedStats.recentDocumentsList.slice(0, 3).map((doc) => (
                      <tr 
                        key={doc.id} 
                        className="border-t cursor-pointer hover:bg-gray-50"
                        onClick={() => setLocation(`/documents/${doc.id}`)}
                      >
                        <td className="text-xs px-2 py-2 text-primary hover:underline">
                          {doc.documentNumber} criado
                        </td>
                        <td className="text-xs text-right px-2 py-2">
                          {format(new Date(doc.createdAt), "dd/MM", { locale: ptBR })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-t">
                      <td className="text-xs px-2 py-2">Nenhum documento recente</td>
                      <td className="text-xs text-right px-2 py-2">-</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Documentos Atribuídos - apenas para usuários não-administradores */}
      {user && user.role !== "Administrator" && (
        <div className="mt-6">
          <AssignedDocuments />
        </div>
      )}
    </div>
  );
}

interface StatusCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  badgeColor: string;
}

function StatusCard({ title, value, icon, badgeColor }: StatusCardProps) {
  // Determinamos qual página abrir com base no título
  const getRouteByTitle = () => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes("prazo")) {
      return "/documents?status=pendente";
    } else if (titleLower.includes("urgentes")) {
      return "/documents?status=urgente";
    } else if (titleLower.includes("análise")) {
      return "/documents?status=em_analise";
    } else if (titleLower.includes("assinar")) {
      return "/documents?status=pendente_assinatura";
    }
    return "/documents";
  };
  
  const [_, setLocation] = useLocation();
  const route = getRouteByTitle();
  
  return (
    <Card 
      className="shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setLocation(route)}
    >
      <CardContent className="p-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-1">{title}</h3>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        <div className={`${badgeColor} p-2 rounded-md`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
