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

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [visaoTipo, setVisaoTipo] = useState<"individual" | "setor" | "setor_e_subordinados">("individual");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
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
                  <h1 className="text-xl font-medium mb-2">Seja bem-vindo (a), José!</h1>
                  <p className="text-gray-500 text-sm">
                    O sistema foi atualizado dia 15/03/2025, com uma nova versão 1.3.7.0. 
                    <button 
                      className="ml-1 text-primary-600 hover:underline" 
                      onClick={() => toast({ title: "Ajuda", description: "Clique aqui para ver as melhorias" })}
                    >
                      Clique aqui e veja as melhorias.
                    </button>
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
          value={stats?.approachingDeadline || 0} 
          icon={<Clock className="h-5 w-5 text-amber-500" />} 
          badgeColor="bg-amber-100 text-amber-500"
        />
        <StatusCard 
          title="Processos urgentes" 
          value={stats?.approachingDeadline || 0} 
          icon={<FileText className="h-5 w-5 text-red-500" />} 
          badgeColor="bg-red-100 text-red-500"
        />
        <StatusCard 
          title="Processos em análise" 
          value={stats ? (stats.totalDocuments - (stats.completedDocuments || 0)) : 0} 
          icon={<FileSignature className="h-5 w-5 text-green-500" />} 
          badgeColor="bg-green-100 text-green-500"
        />
        <StatusCard 
          title="Documentos para assinar" 
          value={0} 
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
              
              {days.map((day, index) => (
                <div key={index} className={`h-8 text-xs flex items-center justify-center ${
                  day === 7 ? 'bg-gray-100 rounded-full border border-gray-200' : ''
                } ${
                  day === null ? 'opacity-0' : ''
                }`}>
                  {day}
                </div>
              ))}
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
                    {(stats && stats.totalDocuments > 0) ? (
                      Array(2).fill(0).map((_, i) => (
                        <tr 
                          key={i} 
                          className="border-t cursor-pointer hover:bg-gray-50"
                          onClick={() => setLocation(`/documents/${i+10}`)}
                        >
                          <td className="text-xs px-2 py-2 text-primary hover:underline">Ofício nº {1000+i}/2025</td>
                          <td className="text-xs text-right px-2 py-2">{i+3}</td>
                        </tr>
                      ))
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
                  {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-2 py-2"><Skeleton className="h-4 w-32" /></td>
                        <td className="px-2 py-2 text-right"><Skeleton className="h-4 w-8 ml-auto" /></td>
                      </tr>
                    ))
                  ) : (stats && stats.totalDocuments > 0) ? (
                    Array(3).fill(0).map((_, i) => (
                      <tr 
                        key={i} 
                        className="border-t cursor-pointer hover:bg-gray-50"
                        onClick={() => setLocation(`/documents/${i+1}`)}
                      >
                        <td className="text-xs px-2 py-2 text-primary hover:underline">12345.123456/2023-{i+1}</td>
                        <td className="text-xs text-right px-2 py-2">{i+1}</td>
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
                  <tr className="border-t">
                    <td className="text-xs px-2 py-2">Nenhuma mensagem</td>
                    <td className="text-xs text-right px-2 py-2">-</td>
                  </tr>
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
