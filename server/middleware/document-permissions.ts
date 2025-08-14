import type { Request, Response, NextFunction } from "express";
import { DocumentService } from "../services/document-service";
import { storage } from "../storage";

const documentService = new DocumentService(storage);

/**
 * Middleware para validar permissões de documento
 */
export async function validateDocumentPermission(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const documentId = Number(req.params.id);
    if (!documentId) {
      return res.status(400).json({ error: "ID do documento inválido" });
    }

    // Verificar se usuário pode acessar/gerenciar o documento
    const { canMove, reason } = await documentService.validateDocumentMovement(user.id, documentId);
    
    if (!canMove) {
      return res.status(403).json({ error: reason || "Acesso negado" });
    }

    next();
  } catch (error) {
    console.error("Error validating document permission:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

/**
 * Middleware para validar se usuário pode excluir documentos
 */
export async function validateDocumentDeletion(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const documentId = Number(req.params.id);
    if (!documentId) {
      return res.status(400).json({ error: "ID do documento inválido" });
    }

    const { canDelete, reason } = await documentService.validateDocumentDeletion(documentId, user.id);
    
    if (!canDelete) {
      return res.status(403).json({ error: reason || "Não é possível excluir este documento" });
    }

    next();
  } catch (error) {
    console.error("Error validating document deletion:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}