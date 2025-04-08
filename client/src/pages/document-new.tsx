import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import DocumentForm from "@/components/documents/document-form";

export default function DocumentNew() {
  const [_, setLocation] = useLocation();

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setLocation("/documents")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar para Documentos
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Cadastrar Novo Documento</h1>
      </div>

      <DocumentForm />
    </div>
  );
}
