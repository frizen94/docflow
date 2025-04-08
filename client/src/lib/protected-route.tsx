import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, Redirect } from "wouter";
import { ReactNode } from "react";

type RouteParams = Record<string, string>;

type ProtectedRouteProps = {
  path: string;
  adminOnly?: boolean;
  children: ReactNode | ((params: RouteParams) => ReactNode);
};

export function ProtectedRoute({
  path,
  adminOnly = false,
  children,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // Se o usuário não estiver autenticado, redirecione para a página de login
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Se a rota for apenas para administradores e o usuário não for um administrador, redirecione
  if (adminOnly && user.role !== "Administrator") {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <h1 className="text-2xl font-bold text-red-500">Acesso Negado</h1>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta página.
          </p>
          <Redirect to="/" />
        </div>
      </Route>
    );
  }

  // Se o usuário estiver autenticado e tiver as permissões necessárias, renderize o componente
  return <Route path={path}>{children}</Route>;
}