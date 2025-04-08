import { useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import { useAuth } from "@/hooks/use-auth";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  // Garantir que temos um usuário
  if (!user) {
    return null; // O ProtectedRoute já deve lidar com isso, mas por segurança
  }

  // Função para obter o título da página com base na rota atual
  const getPageTitle = () => {
    switch (true) {
      case location === "/":
        return "Painel de Controle";
      case location === "/documents":
        return "Documentos";
      case location.startsWith("/documents/new"):
        return "Novo Documento";
      case location.startsWith("/documents/"):
        return "Detalhes do Documento";
      case location === "/areas":
        return "Áreas";
      case location === "/document-types":
        return "Tipos de Documento";
      case location === "/employees":
        return "Funcionários";
      case location === "/users":
        return "Usuários";
      default:
        return "DocFlow";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <Navbar
          title={getPageTitle()}
          user={user}
          openSidebar={() => setSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
