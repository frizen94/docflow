import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Esquema de validação para login
const loginSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

// Esquema de validação para registro
const registerSchema = z.object({
  username: z.string().min(3, "Nome de usuário deve ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  name: z.string().min(1, "Nome completo é obrigatório"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [_, setLocation] = useLocation();
  const { user, isLoading, loginMutation, registerAdminMutation, hasAdmin, checkingAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");

  // Redirecionar para a página inicial se o usuário já estiver autenticado
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Configuração do formulário de login
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Configuração do formulário de registro
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
    },
  });

  // Função para lidar com o envio do formulário de login
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  // Função para lidar com o envio do formulário de registro
  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerAdminMutation.mutate({
      ...data,
      role: "Administrator", // O primeiro usuário sempre será um administrador
    });
  };

  if (isLoading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Coluna esquerda (formulário) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-white">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 flex flex-col items-center text-center">
            <div className="bg-primary p-3 rounded-full mb-4">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">DocFlow</CardTitle>
            <CardDescription>
              Sistema de Gestão de Documentos
            </CardDescription>
          </CardHeader>

          <CardContent>
            {hasAdmin === false ? (
              <>
                <Alert className="mb-6">
                  <AlertTitle>Configuração inicial</AlertTitle>
                  <AlertDescription>
                    Você precisa criar um usuário administrador para começar a usar o sistema.
                  </AlertDescription>
                </Alert>

                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Digite seu nome completo"
                              disabled={registerAdminMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome de Usuário</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Digite seu nome de usuário"
                              disabled={registerAdminMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Digite sua senha"
                              disabled={registerAdminMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerAdminMutation.isPending}
                    >
                      {registerAdminMutation.isPending ? "Registrando..." : "Registrar Administrador"}
                    </Button>
                  </form>
                </Form>
              </>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register" disabled>
                    Registro
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome de Usuário</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Digite seu nome de usuário"
                                disabled={loginMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Digite sua senha"
                                disabled={loginMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Entrando..." : "Entrar"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register">
                  <div className="text-center py-4 text-gray-500">
                    Funcionalidade disponível apenas para administradores
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center border-t pt-4">
            <p className="text-sm text-gray-500">
              Sistema de Gerenciamento de Documentos e Trâmites
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Coluna direita (hero/informações) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/90 to-primary flex items-center justify-center text-white p-8">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold mb-4">
            Bem-vindo ao DocFlow
          </h1>
          
          <p className="text-lg mb-6">
            Uma solução completa para gerenciamento de documentos e processos organizacionais.
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-2">
              <div className="bg-white/20 p-1 rounded-full mt-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.3334 4L6.00002 11.3333L2.66669 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Rastreamento de Documentos</h3>
                <p className="text-white/80 text-sm">Acompanhe o histórico completo dos seus documentos</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="bg-white/20 p-1 rounded-full mt-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.3334 4L6.00002 11.3333L2.66669 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Controle de Prazos</h3>
                <p className="text-white/80 text-sm">Gerencie prazos de forma eficiente e receba alertas</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="bg-white/20 p-1 rounded-full mt-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.3334 4L6.00002 11.3333L2.66669 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Fluxo de Trabalho Automatizado</h3>
                <p className="text-white/80 text-sm">Encaminhe documentos entre áreas e funcionários</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}