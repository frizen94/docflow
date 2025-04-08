import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Tipos para as operações de autenticação
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<void, Error, RegisterData>;
  registerAdminMutation: UseMutationResult<void, Error, RegisterData>;
  hasAdmin: boolean | null;
  checkingAdmin: boolean;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  name: string;
  role: "Administrator" | "Usuário";
};

// Criar o contexto de autenticação
export const AuthContext = createContext<AuthContextType | null>(null);

// Provider que vai fornecer os dados e funções de autenticação para a aplicação
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  // Consulta para obter o usuário atual
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/session"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Consulta para verificar se já existe um administrador no sistema
  const {
    data: adminCheck,
    isLoading: checkingAdmin,
  } = useQuery<{ hasAdmin: boolean }, Error>({
    queryKey: ["/api/system/check"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Mutação para fazer login
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/session"], user);
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo, ${user.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha no login",
        description: error.message || "Usuário ou senha inválidos",
        variant: "destructive",
      });
    },
  });

  // Mutação para registrar um novo usuário
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/register/user", userData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuário registrado com sucesso",
        description: "O novo usuário foi criado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha no registro",
        description: error.message || "Não foi possível registrar o usuário",
        variant: "destructive",
      });
    },
  });

  // Mutação para registrar o administrador inicial
  const registerAdminMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/register/admin", userData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system/check"] });
      toast({
        title: "Administrador registrado com sucesso",
        description: "Você pode fazer login agora",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha no registro do administrador",
        description: error.message || "Não foi possível registrar o administrador",
        variant: "destructive",
      });
    },
  });

  // Mutação para fazer logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("GET", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/session"], null);
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado do sistema",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha no logout",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Retornar o provider com todos os valores e funções
  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        registerAdminMutation,
        hasAdmin: adminCheck?.hasAdmin ?? null,
        checkingAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}