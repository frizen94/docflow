import { useState } from "react";
import { useLocation } from "wouter";
import { User } from "@shared/schema";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";

interface LayoutProps {
  children: React.ReactNode;
  user: User;
}

export default function Layout({ children, user }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  // Function to get page title based on current route
  const getPageTitle = () => {
    switch (true) {
      case location === "/":
        return "Dashboard";
      case location === "/documents":
        return "Documents";
      case location.startsWith("/documents/new"):
        return "New Document";
      case location.startsWith("/documents/"):
        return "Document Details";
      case location === "/areas":
        return "Areas";
      case location === "/document-types":
        return "Document Types";
      case location === "/employees":
        return "Employees";
      case location === "/users":
        return "Users";
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
