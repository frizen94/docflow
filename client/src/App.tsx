import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import { getSession, AuthUser } from "./lib/auth";

// Pages
import Layout from "./pages/layout";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Documents from "./pages/documents";
import DocumentDetails from "./pages/document-details";
import DocumentNew from "./pages/document-new";
import Areas from "./pages/areas";
import DocumentTypes from "./pages/document-types";
import Employees from "./pages/employees";
import Users from "./pages/users";
import NotFound from "./pages/not-found";

function App() {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getSession();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !user && location !== "/login") {
      setLocation("/login");
    }
  }, [user, loading, location, setLocation]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-solid rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/login">
          <Login setUser={setUser} />
        </Route>
        
        {user && (
          <Route path="/">
            <Layout user={user}>
              <Dashboard />
            </Layout>
          </Route>
        )}
        
        {user && (
          <Route path="/documents">
            <Layout user={user}>
              <Documents />
            </Layout>
          </Route>
        )}
        
        {user && (
          <Route path="/documents/new">
            <Layout user={user}>
              <DocumentNew />
            </Layout>
          </Route>
        )}
        
        {user && (
          <Route path="/documents/:id">
            {params => (
              <Layout user={user}>
                <DocumentDetails id={Number(params.id)} />
              </Layout>
            )}
          </Route>
        )}
        
        {user && (
          <Route path="/areas">
            <Layout user={user}>
              <Areas />
            </Layout>
          </Route>
        )}
        
        {user && (
          <Route path="/document-types">
            <Layout user={user}>
              <DocumentTypes />
            </Layout>
          </Route>
        )}
        
        {user && (
          <Route path="/employees">
            <Layout user={user}>
              <Employees />
            </Layout>
          </Route>
        )}
        
        {user && (
          <Route path="/users">
            <Layout user={user}>
              <Users />
            </Layout>
          </Route>
        )}
        
        <Route>
          <NotFound />
        </Route>
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
