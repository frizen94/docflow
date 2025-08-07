import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Pages
import Layout from "./pages/layout";
import AuthPage from "./pages/auth-page";
import Dashboard from "./pages/dashboard";
import Documents from "./pages/documents";
import DocumentDetails from "./pages/document-details";
// DocumentNew foi substituído pelo modal
import Areas from "./pages/areas";
import DocumentTypes from "./pages/document-types";
import Employees from "./pages/employees";
import Users from "./pages/users";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/auth">
        <AuthPage />
      </Route>
      
      <ProtectedRoute path="/">
        <Layout>
          <Dashboard />
        </Layout>
      </ProtectedRoute>
      
      <ProtectedRoute path="/documents">
        <Layout>
          <Documents />
        </Layout>
      </ProtectedRoute>
      
      {/* Rota de documento novo foi substituída pelo modal */}
      
      <ProtectedRoute path="/documents/:id">
        {(params) => (
          <Layout>
            <DocumentDetails id={Number(params.id)} />
          </Layout>
        )}
      </ProtectedRoute>
      
      <ProtectedRoute path="/areas">
        <Layout>
          <Areas />
        </Layout>
      </ProtectedRoute>
      
      <ProtectedRoute path="/document-types">
        <Layout>
          <DocumentTypes />
        </Layout>
      </ProtectedRoute>
      
      <ProtectedRoute path="/employees">
        <Layout>
          <Employees />
        </Layout>
      </ProtectedRoute>
      
      <ProtectedRoute path="/users">
        <Layout>
          <Users />
        </Layout>
      </ProtectedRoute>
      
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
