import { Link, useLocation } from "wouter";
import { User } from "@shared/schema";
import {
  FileSignature,
  Users,
  FolderOpen,
  FileText,
  UserRound,
  LogOut,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  user: User;
  isOpen: boolean;
  closeSidebar: () => void;
}

export default function Sidebar({ user, isOpen, closeSidebar }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/auth");
      }
    });
  };

  const isActive = (path: string) => {
    return location === path;
  };

  const menuItems = [
    {
      name: "Painel de Controle",
      path: "/",
      icon: <Home className="mr-4 h-6 w-6" />,
      roles: ["Administrator", "Secretary"],
    },
    {
      name: "Documentos",
      path: "/documents",
      icon: <FileSignature className="mr-4 h-6 w-6" />,
      roles: ["Administrator", "Secretary"],
    },
    {
      name: "Funcionários",
      path: "/employees",
      icon: <Users className="mr-4 h-6 w-6" />,
      roles: ["Administrator"],
    },
    {
      name: "Áreas",
      path: "/areas",
      icon: <FolderOpen className="mr-4 h-6 w-6" />,
      roles: ["Administrator"],
    },
    {
      name: "Tipos de Doc",
      path: "/document-types",
      icon: <FileText className="mr-4 h-6 w-6" />,
      roles: ["Administrator"],
    },
    {
      name: "Usuários",
      path: "/users",
      icon: <UserRound className="mr-4 h-6 w-6" />,
      roles: ["Administrator"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => 
    item.roles.includes(user.role)
  );

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 transition-transform duration-300 transform bg-gray-900 lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold text-white">DocFlow</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-gray-300 hover:text-white"
            onClick={closeSidebar}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
                {user.name.charAt(0)}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs font-medium text-gray-400">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {filteredMenuItems.map((item) => (
            <div key={item.path} onClick={() => {
              setLocation(item.path);
              closeSidebar();
            }}>
              <div
                className={cn(
                  "group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors duration-150 cursor-pointer",
                  isActive(item.path)
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                )}
              >
                {item.icon}
                {item.name}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-6 py-4 border-t border-gray-800">
          <Button
            variant="ghost"
            className="flex items-center text-gray-300 hover:text-white transition-colors duration-150 w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Sair</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
