import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { DocumentService } from "./services/document-service";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  insertUserSchema, 
  insertAreaSchema, 
  insertDocumentTypeSchema, 
  insertEmployeeSchema, 
  insertDocumentSchema, 
  insertDocumentTrackingSchema,
  insertDocumentAttachmentSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { hashPassword, verifyPassword, isAdmin, isAuthenticated, hasAdminUser, createAdminUser } from "./auth";
import { validateDocumentPermission, validateDocumentDeletion } from "./middleware/document-permissions";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize document service
  const documentService = new DocumentService(storage);
  
  // Initialize session
  const MemoryStoreSession = MemoryStore(session);
  app.use(
    session({
      secret: "docflow-secret",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // Prune expired entries every 24h
      }),
    })
  );

  // Initialize passport for authentication
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport to use local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Nome de usuário incorreto" });
        }
        
        // Verifica se a senha corresponde usando bcrypt
        const isPasswordValid = await verifyPassword(user.password, password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Senha incorreta" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize and deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Helper function to handle validation errors
  function handleValidationError(error: unknown, res: Response) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.message });
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Check authentication middleware
  function isAuthenticated(req: Request, res: Response, next: Function) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: "Not authenticated" });
  }

  // Check if user is admin middleware
  function isAdmin(req: Request, res: Response, next: Function) {
    if (req.isAuthenticated() && (req.user as any).role === "Administrator") {
      return next();
    }
    res.status(403).json({ error: "Not authorized" });
  }

  // Authentication Routes
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/session", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  // User Routes
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve users" });
    }
  });

  app.get("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(Number(req.params.id));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve user" });
    }
  });

  app.post("/api/users", isAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ error: "Nome de usuário já existe" });
      }
      
      // Cria hash da senha
      const hashedPassword = await hashPassword(userData.password);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      res.status(201).json(user);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.put("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      
      // Se a senha estiver sendo atualizada, gere o hash dela
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }
      
      const updatedUser = await storage.updateUser(id, userData);
      if (!updatedUser) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      res.json(updatedUser);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.delete("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Area Routes
  app.get("/api/areas", isAuthenticated, async (req, res) => {
    try {
      const areas = await storage.listAreas();
      res.json(areas);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve areas" });
    }
  });

  app.get("/api/areas/:id", isAuthenticated, async (req, res) => {
    try {
      const area = await storage.getArea(Number(req.params.id));
      if (!area) {
        return res.status(404).json({ error: "Area not found" });
      }
      res.json(area);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve area" });
    }
  });

  app.post("/api/areas", isAdmin, async (req, res) => {
    try {
      const areaData = insertAreaSchema.parse(req.body);
      const area = await storage.createArea(areaData);
      res.status(201).json(area);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.put("/api/areas/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const areaData = insertAreaSchema.partial().parse(req.body);
      const updatedArea = await storage.updateArea(id, areaData);
      if (!updatedArea) {
        return res.status(404).json({ error: "Area not found" });
      }
      res.json(updatedArea);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.delete("/api/areas/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const deleted = await storage.deleteArea(id);
      if (!deleted) {
        return res.status(404).json({ error: "Area not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete area" });
    }
  });

  // Document Type Routes
  app.get("/api/document-types", isAuthenticated, async (req, res) => {
    try {
      const documentTypes = await storage.listDocumentTypes();
      res.json(documentTypes);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve document types" });
    }
  });

  app.get("/api/document-types/:id", isAuthenticated, async (req, res) => {
    try {
      const documentType = await storage.getDocumentType(Number(req.params.id));
      if (!documentType) {
        return res.status(404).json({ error: "Document type not found" });
      }
      res.json(documentType);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve document type" });
    }
  });

  app.post("/api/document-types", isAdmin, async (req, res) => {
    try {
      const documentTypeData = insertDocumentTypeSchema.parse(req.body);
      const documentType = await storage.createDocumentType(documentTypeData);
      res.status(201).json(documentType);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.put("/api/document-types/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const documentTypeData = insertDocumentTypeSchema.partial().parse(req.body);
      const updatedDocumentType = await storage.updateDocumentType(id, documentTypeData);
      if (!updatedDocumentType) {
        return res.status(404).json({ error: "Document type not found" });
      }
      res.json(updatedDocumentType);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.delete("/api/document-types/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const deleted = await storage.deleteDocumentType(id);
      if (!deleted) {
        return res.status(404).json({ error: "Document type not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete document type" });
    }
  });

  app.get("/api/employees", isAuthenticated, async (req, res) => {
    try {
      const employees = await storage.listEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve employees" });
    }
  });

  app.get("/api/employees/area/:areaId", isAuthenticated, async (req, res) => {
    try {
      const areaId = Number(req.params.areaId);
      if (isNaN(areaId)) {
        return res.status(400).json({ error: "Invalid area ID" });
      }
      const employees = await storage.getEmployeesByArea(areaId);
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve employees for area" });
    }
  });

  app.get("/api/employees/:id", isAuthenticated, async (req, res) => {
    try {
      const employee = await storage.getEmployee(Number(req.params.id));
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve employee" });
    }
  });

  app.get("/api/employees/dni/:dni", isAuthenticated, async (req, res) => {
    try {
      const employee = await storage.getEmployeeByDni(req.params.dni);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve employee" });
    }
  });

  app.post("/api/employees", isAdmin, async (req, res) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      const existingEmployee = await storage.getEmployeeByDni(employeeData.dni);
      if (existingEmployee) {
        return res.status(409).json({ error: "Employee with this DNI already exists" });
      }
      const employee = await storage.createEmployee(employeeData);
      res.status(201).json(employee);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.put("/api/employees/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const employeeData = insertEmployeeSchema.partial().parse(req.body);
      const updatedEmployee = await storage.updateEmployee(id, employeeData);
      if (!updatedEmployee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(updatedEmployee);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.delete("/api/employees/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const deleted = await storage.deleteEmployee(id);
      if (!deleted) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete employee" });
    }
  });

  // Document Routes - using business service
  app.get("/api/documents", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const documents = await documentService.listDocumentsForUser(userId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve documents" });
    }
  });

  app.get("/api/documents/assigned", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user.employeeId) {
        return res.json([]);
      }
      
      const documents = await storage.getAssignedDocuments(user.employeeId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve assigned documents" });
    }
  });

  app.get("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      const document = await storage.getDocument(Number(req.params.id));
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve document" });
    }
  });

  app.get("/api/documents/tracking/:trackingNumber", isAuthenticated, async (req, res) => {
    try {
      const document = await storage.getDocumentByTrackingNumber(req.params.trackingNumber);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve document" });
    }
  });

  app.get("/api/documents/area/:areaId", isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.getDocumentsByAreaId(Number(req.params.areaId));
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve documents" });
    }
  });

  app.get("/api/documents/status/:status", isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.getDocumentsByStatus(req.params.status);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve documents" });
    }
  });

  app.get("/api/documents/deadline/:days", isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.getDocumentsWithDeadline(Number(req.params.days));
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve documents" });
    }
  });
  
  app.get("/api/documents/employee/:employeeId", isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.getDocumentsByEmployeeId(Number(req.params.employeeId));
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Falha ao recuperar documentos por funcionário" });
    }
  });

  app.post("/api/documents", isAuthenticated, async (req, res) => {
    try {
      console.log("Received document data:", req.body);
      console.log("deadlineDays value:", req.body.deadlineDays, "type:", typeof req.body.deadlineDays);
      
      const documentData = {
        ...req.body,
        folios: parseInt(req.body.folios) || 1,
        deadlineDays: req.body.deadlineDays && !isNaN(Number(req.body.deadlineDays)) ? Number(req.body.deadlineDays) : null,
        documentTypeId: Number(req.body.documentTypeId),
        originAreaId: Number(req.body.originAreaId),
        currentAreaId: req.body.currentAreaId ? Number(req.body.currentAreaId) : Number(req.body.originAreaId),
        currentEmployeeId: req.body.currentEmployeeId ? Number(req.body.currentEmployeeId) : null,
      };

      console.log("Processed deadlineDays:", documentData.deadlineDays);

      const document = await documentService.createDocument(documentData, (req.user as any).id);
      console.log("Document created successfully with business service:", document);
      
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Falha ao criar documento"
      });
    }
  });

  app.put("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      console.log("Updating document data:", req.body);
      const id = Number(req.params.id);
      
      const payload = { ...req.body };
      
      // Converter IDs para números
      ['documentTypeId', 'originAreaId', 'currentAreaId', 'currentEmployeeId'].forEach(field => {
        if (payload[field]) {
          payload[field] = Number(payload[field]);
        }
      });
      
      // Converter deadline de string para Date se necessário
      if (payload.deadline && typeof payload.deadline === 'string') {
        payload.deadline = new Date(payload.deadline);
      }
      
      try {
        const documentData = insertDocumentSchema.partial().parse(payload);
        console.log("Parsed document update data:", documentData);
        const updatedDocument = await storage.updateDocument(id, documentData);
        
        if (!updatedDocument) {
          return res.status(404).json({ error: "Documento não encontrado" });
        }
        
        console.log("Document updated successfully:", updatedDocument);
        res.json(updatedDocument);
      } catch (validationError) {
        console.error("Validation error in document update:", validationError);
        handleValidationError(validationError, res);
      }
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ 
        error: "Falha ao atualizar documento", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.delete("/api/documents/:id", isAuthenticated, validateDocumentDeletion, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const userId = (req.user as any).id;
      
      await documentService.deleteDocument(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Failed to delete document" 
      });
    }
  });

  // Document Tracking Routes
  app.get("/api/document-tracking/:id", isAuthenticated, async (req, res) => {
    try {
      const tracking = await storage.getDocumentTracking(Number(req.params.id));
      if (!tracking) {
        return res.status(404).json({ error: "Document tracking entry not found" });
      }
      res.json(tracking);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve tracking entry" });
    }
  });

  app.get("/api/document-tracking/document/:documentId", isAuthenticated, async (req, res) => {
    try {
      const trackingEntries = await storage.listDocumentTrackingByDocumentId(Number(req.params.documentId));
      res.json(trackingEntries);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve tracking entries" });
    }
  });

  app.get("/api/recent-activities/:limit", isAuthenticated, async (req, res) => {
    try {
      const activities = await storage.getRecentActivities(Number(req.params.limit));
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve recent activities" });
    }
  });

  app.post("/api/document-tracking", isAuthenticated, async (req, res) => {
    try {
      const { documentId, toAreaId, toEmployeeId, description, deadlineDays } = req.body;
      const userId = (req.user as any).id;
      
      const tracking = await documentService.moveDocument(
        Number(documentId),
        Number(toAreaId),
        toEmployeeId ? Number(toEmployeeId) : null,
        description || "",
        deadlineDays ? Number(deadlineDays) : null,
        userId
      );
      
      res.status(201).json(tracking);
    } catch (error) {
      console.error("Error moving document:", error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Failed to move document" 
      });
    }
  });
  
  // Rotas de encaminhamento usando serviço de negócio
  app.post("/api/documents/:id/forward-to-area", isAuthenticated, validateDocumentPermission, async (req, res) => {
    try {
      const documentId = Number(req.params.id);
      const { toAreaId, description, deadlineDays } = req.body;
      const userId = (req.user as any).id;
      
      if (!toAreaId) {
        return res.status(400).json({ error: "Área de destino é obrigatória" });
      }
      
      const tracking = await documentService.moveDocument(
        documentId,
        Number(toAreaId),
        null, // sem funcionário específico
        description || "",
        deadlineDays ? Number(deadlineDays) : null,
        userId
      );
      
      res.status(201).json(tracking);
    } catch (error) {
      console.error("Error forwarding to area:", error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Erro ao encaminhar documento para área" 
      });
    }
  });

  // Rota para atribuir responsável (sem mudar área)
  app.post("/api/documents/:id/assign-employee", isAuthenticated, validateDocumentPermission, async (req, res) => {
    try {
      const documentId = Number(req.params.id);
      const { toEmployeeId, description, deadlineDays } = req.body;
      const userId = (req.user as any).id;
      
      console.log("assign-employee called with:", { documentId, toEmployeeId, description, deadlineDays });
      
      if (!toEmployeeId) {
        return res.status(400).json({ error: "Funcionário responsável é obrigatório" });
      }
      
      // Buscar o documento atual para manter a mesma área
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ error: "Documento não encontrado" });
      }
      
      // Atribuir funcionário mantendo a mesma área
      const tracking = await documentService.moveDocument(
        documentId,
        document.currentAreaId, // Mantém a área atual
        Number(toEmployeeId),
        description || "Atribuição de responsável",
        deadlineDays ? Number(deadlineDays) : null,
        userId
      );
      
      res.status(201).json(tracking);
    } catch (error) {
      console.error("Error assigning employee:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Erro ao atribuir responsável" 
      });
    }
  });
  
  app.post("/api/documents/:id/forward-to-employee", isAuthenticated, validateDocumentPermission, async (req, res) => {
    try {
      const documentId = Number(req.params.id);
      const { toAreaId, toEmployeeId, description, deadlineDays } = req.body;
      const userId = (req.user as any).id;
      
      if (!toAreaId) {
        return res.status(400).json({ error: "Área de destino é obrigatória" });
      }
      
      if (!toEmployeeId) {
        return res.status(400).json({ error: "Funcionário de destino é obrigatório" });
      }
      
      const tracking = await documentService.moveDocument(
        documentId,
        Number(toAreaId),
        Number(toEmployeeId),
        description || "",
        deadlineDays ? Number(deadlineDays) : null,
        userId
      );
      
      res.status(201).json(tracking);
    } catch (error) {
      console.error("Error forwarding to employee:", error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Erro ao encaminhar documento para funcionário" 
      });
    }
  });

  // Rota para atribuir documento a funcionário específico
  app.post("/api/documents/:id/assign", isAuthenticated, validateDocumentPermission, async (req, res) => {
    try {
      const documentId = Number(req.params.id);
      const { employeeId } = req.body;
      const userId = (req.user as any).id;
      
      if (!employeeId) {
        return res.status(400).json({ error: "ID do funcionário é obrigatório" });
      }
      
      await documentService.assignDocument(documentId, Number(employeeId), userId);
      res.json({ success: true, message: "Documento atribuído com sucesso" });
    } catch (error) {
      console.error("Error assigning document:", error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Erro ao atribuir documento" 
      });
    }
  });

  // Rota para atualizar status do documento
  app.post("/api/documents/:id/status", isAuthenticated, validateDocumentPermission, async (req, res) => {
    try {
      const documentId = Number(req.params.id);
      const { status } = req.body;
      const userId = (req.user as any).id;
      
      if (!status) {
        return res.status(400).json({ error: "Status é obrigatório" });
      }
      
      await documentService.updateDocumentStatus(documentId, status, userId);
      res.json({ success: true, message: "Status atualizado com sucesso" });
    } catch (error) {
      console.error("Error updating document status:", error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Erro ao atualizar status" 
      });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.listDocuments();
      const completedDocuments = await storage.getDocumentsByStatus("Completed");
      const approachingDeadline = await storage.getDocumentsWithDeadline(3);
      const users = await storage.listUsers();
      
      res.json({
        totalDocuments: documents.length,
        completedDocuments: completedDocuments.length,
        approachingDeadline: approachingDeadline.length,
        totalUsers: users.length
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve dashboard stats" });
    }
  });

  // Dashboard detailed stats
  app.get("/api/dashboard/detailed-stats", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      // Buscar estatísticas detalhadas
      const allDocuments = await storage.listDocuments();
      const pendingDocuments = allDocuments.filter(d => d.status === 'Pending');
      const urgentDocuments = allDocuments.filter(d => d.priority === 'Urgente');
      const inAnalysisDocuments = allDocuments.filter(d => d.status === 'Em Análise');
      const completedDocuments = allDocuments.filter(d => d.status === 'Completed');
      const unassignedDocuments = allDocuments.filter(d => !d.currentEmployeeId);
      
      // Documentos com prazo próximo (próximos 7 dias)
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcomingDeadlines = allDocuments.filter(d => {
        if (!d.deadline) return false;
        const deadline = new Date(d.deadline);
        return deadline >= now && deadline <= nextWeek;
      });
      
      // Documentos por área (se for admin)
      let documentsByArea = [];
      if (user.role === 'Administrator') {
        const areas = await storage.listAreas();
        documentsByArea = areas.map(area => ({
          areaName: area.name,
          count: allDocuments.filter(d => d.currentAreaId === area.id).length
        }));
      }
      
      // Documentos recentes (últimos 30 dias)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentDocuments = allDocuments.filter(d => {
        const createdAt = new Date(d.createdAt);
        return createdAt >= thirtyDaysAgo;
      });
      
      res.json({
        totalDocuments: allDocuments.length,
        pendingDocuments: pendingDocuments.length,
        urgentDocuments: urgentDocuments.length,
        inAnalysisDocuments: inAnalysisDocuments.length,
        completedDocuments: completedDocuments.length,
        documentsToAssign: unassignedDocuments.length,
        upcomingDeadlines: upcomingDeadlines.length,
        upcomingDeadlinesList: upcomingDeadlines,
        documentsByArea,
        recentDocumentsCount: recentDocuments.length,
        recentDocumentsList: recentDocuments.slice(0, 10) // Últimos 10
      });
    } catch (error) {
      console.error('Dashboard detailed stats error:', error);
      res.status(500).json({ error: "Failed to retrieve detailed dashboard stats" });
    }
  });

  // Calendar events - documentos com prazo no mês
  app.get("/api/dashboard/calendar/:year/:month", isAuthenticated, async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      
      // Buscar todos os documentos
      const allDocuments = await storage.listDocuments();
      
      // Filtrar documentos com deadline no mês especificado
      const documentsInMonth = allDocuments.filter(doc => {
        if (!doc.deadline) return false;
        const deadline = new Date(doc.deadline);
        return deadline.getFullYear() === year && deadline.getMonth() === month - 1;
      });
      
      // Agrupar por dia
      const calendarEvents = documentsInMonth.reduce((acc: any, doc: any) => {
        const day = new Date(doc.deadline).getDate();
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push({
          id: doc.id,
          documentNumber: doc.documentNumber,
          subject: doc.subject,
          priority: doc.priority,
          deadline: doc.deadline
        });
        return acc;
      }, {});
      
      res.json(calendarEvents);
    } catch (error) {
      console.error('Calendar events error:', error);
      res.status(500).json({ error: "Failed to retrieve calendar events" });
    }
  });

  // Processos em análise por tempo
  app.get("/api/dashboard/analysis-by-time", isAuthenticated, async (req, res) => {
    try {
      const allDocuments = await storage.listDocuments();
      const inAnalysisDocuments = allDocuments.filter(d => d.status === 'Em Análise');
      
      const documentsWithTime = inAnalysisDocuments.map(doc => {
        const createdAt = new Date(doc.createdAt);
        const now = new Date();
        const daysInAnalysis = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: doc.id,
          documentNumber: doc.documentNumber,
          subject: doc.subject,
          daysInAnalysis,
          priority: doc.priority
        };
      });
      
      res.json(documentsWithTime);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve analysis time data" });
    }
  });

  // Document Attachments Routes
  app.get("/api/documents/:documentId/attachments", isAuthenticated, async (req, res) => {
    try {
      const documentId = Number(req.params.documentId);
      const attachments = await storage.listDocumentAttachments(documentId);
      res.json(attachments);
    } catch (error) {
      console.error("Error retrieving attachments:", error);
      res.status(500).json({ error: "Failed to retrieve attachments" });
    }
  });

  app.get("/api/documents/:documentId/attachments/category/:category", isAuthenticated, async (req, res) => {
    try {
      const documentId = Number(req.params.documentId);
      const category = req.params.category;
      const attachments = await storage.getAttachmentsByCategory(documentId, category);
      res.json(attachments);
    } catch (error) {
      console.error("Error retrieving attachments by category:", error);
      res.status(500).json({ error: "Failed to retrieve attachments by category" });
    }
  });

  app.get("/api/attachments/:id", isAuthenticated, async (req, res) => {
    try {
      const attachment = await storage.getDocumentAttachment(Number(req.params.id));
      if (!attachment) {
        return res.status(404).json({ error: "Attachment not found" });
      }
      res.json(attachment);
    } catch (error) {
      console.error("Error retrieving attachment:", error);
      res.status(500).json({ error: "Failed to retrieve attachment" });
    }
  });

  // Download attachment file
  app.get("/api/attachments/:id/download", isAuthenticated, async (req, res) => {
    try {
      const attachment = await storage.getDocumentAttachment(Number(req.params.id));
      if (!attachment) {
        return res.status(404).json({ error: "Attachment not found" });
      }

      // Check if file exists
      if (!fs.existsSync(attachment.filePath)) {
        return res.status(404).json({ error: "File not found on disk" });
      }

      // Set headers for download
      res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
      res.setHeader('Content-Type', attachment.mimeType);
      
      // Send file
      res.sendFile(path.resolve(attachment.filePath));
    } catch (error) {
      console.error("Error downloading attachment:", error);
      res.status(500).json({ error: "Failed to retrieve attachment" });
    }
  });

  app.delete("/api/attachments/:id", isAuthenticated, async (req, res) => {
    try {
      const attachmentId = Number(req.params.id);
      const attachment = await storage.getDocumentAttachment(attachmentId);
      
      if (!attachment) {
        return res.status(404).json({ error: "Attachment not found" });
      }

      // Verificar se o usuário tem permissão para deletar o anexo
      const document = await storage.getDocument(attachment.documentId);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      const user = req.user as any;
      const isOwner = attachment.uploadedBy === user.id;
      const isDocumentOwner = document.createdBy === user.id;
      const hasAreaAccess = user.areaId === document.currentAreaId;
      
      if (user.role !== 'Administrator' && !isOwner && !isDocumentOwner && !hasAreaAccess) {
        return res.status(403).json({ error: "Não autorizado a deletar este anexo" });
      }

      // Deletar arquivo físico
      if (fs.existsSync(attachment.filePath)) {
        fs.unlinkSync(attachment.filePath);
      }

      // Deletar registro do banco
      const deleted = await storage.deleteDocumentAttachment(attachmentId);
      
      if (deleted) {
        res.json({ success: true, message: "Anexo deletado com sucesso" });
      } else {
        res.status(500).json({ error: "Failed to delete attachment from database" });
      }
    } catch (error) {
      console.error("Error deleting attachment:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to delete attachment" 
      });
    }
  });

  // Upload attachment to document
  app.post("/api/documents/:documentId/attachments", isAuthenticated, async (req, res) => {
    uploadAttachment.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ 
          error: err.message || 'Erro ao fazer upload do arquivo' 
        });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      try {
        const documentId = Number(req.params.documentId);
        const { category, description, version } = req.body;
        const userId = (req.user as any).id;

        // Get document to create process folder
        const document = await storage.getDocument(documentId);
        if (!document) {
          // Clean up uploaded file
          fs.unlinkSync(req.file.path);
          return res.status(404).json({ error: "Document not found" });
        }

        // Create process folder
        const processFolder = path.join(uploadDir, document.documentNumber);
        if (!fs.existsSync(processFolder)) {
          fs.mkdirSync(processFolder, { recursive: true });
        }

        // Move file to process folder
        const originalPath = req.file.path;
        const newPath = path.join(processFolder, req.file.filename);
        fs.renameSync(originalPath, newPath);

        // Create attachment record
        const attachmentData = {
          documentId,
          fileName: req.file.filename,
          originalName: req.file.originalname,
          filePath: newPath,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          category: category || 'Anexo',
          description: description || null,
          version: version || '1.0',
          uploadedBy: userId
        };

        const attachment = await storage.createDocumentAttachment(attachmentData);
        
        res.status(201).json({
          success: true,
          attachment,
          message: "Anexo enviado com sucesso"
        });
      } catch (error) {
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        
        console.error("Error uploading attachment:", error);
        res.status(500).json({ 
          error: error instanceof Error ? error.message : "Failed to upload attachment" 
        });
      }
    });
  });

  // Download attachment
  app.get("/api/attachments/:id/download", isAuthenticated, async (req, res) => {
    try {
      const attachment = await storage.getDocumentAttachment(Number(req.params.id));
      if (!attachment) {
        return res.status(404).json({ error: "Attachment not found" });
      }

      // Check if file exists
      if (!fs.existsSync(attachment.filePath)) {
        return res.status(404).json({ error: "File not found on disk" });
      }

      // Set appropriate headers
      res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
      res.setHeader('Content-Type', attachment.mimeType);

      // Stream file
      const fileStream = fs.createReadStream(attachment.filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Error downloading attachment:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to download attachment" 
      });
    }
  });

  // Set up file uploads
  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Configure multer for file storage
  const fileStorage = multer.diskStorage({
    destination: function(_req, _file, cb) {
      cb(null, uploadDir);
    },
    filename: function(_req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  // Configure multer for process-organized attachments
  const attachmentStorage = multer.diskStorage({
    destination: function(req, _file, cb) {
      // Get document number from request to create process folder
      const documentId = req.params.documentId || req.body.documentId;
      if (!documentId) {
        return cb(new Error('Document ID is required'), '');
      }
      
      // Create process folder if it doesn't exist
      // We'll get the document number from the database
      cb(null, uploadDir); // Temporary, will be updated in the route handler
    },
    filename: function(_req, file, cb) {
      const timestamp = Date.now();
      const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      cb(null, `${timestamp}-${cleanName}`);
    }
  });

  const upload = multer({
    storage: fileStorage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB file size limit
    },
    fileFilter: (_req, file, cb) => {
      // Accept only specific file types
      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        // @ts-ignore - Multer types don't match correct callback signature
        cb(new Error('Tipo de arquivo inválido. Apenas arquivos PDF, DOC, DOCX, JPG e PNG são permitidos.'), false);
      }
    }
  });

  const uploadAttachment = multer({
    storage: attachmentStorage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB file size limit
    },
    fileFilter: (_req, file, cb) => {
      // Accept only specific file types
      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'text/plain'
      ];
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        // @ts-ignore - Multer types don't match correct callback signature
        cb(new Error('Tipo de arquivo inválido. Apenas arquivos PDF, DOC, DOCX, XLS, XLSX, JPG, PNG e TXT são permitidos.'), false);
      }
    }
  });

  // File upload endpoint - Modified to support document folder structure
  app.post('/api/upload', isAuthenticated, (req, res) => {
    upload.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ 
          error: err.message || 'Erro ao fazer upload do arquivo' 
        });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      try {
        // Get documentId from request body or query
        const documentId = req.body.documentId || req.query.documentId;
        
        if (documentId) {
          // If documentId is provided, use folder structure
          const document = await storage.getDocument(Number(documentId));
          if (document) {
            // Create process folder
            const processFolder = path.join(uploadDir, document.documentNumber);
            if (!fs.existsSync(processFolder)) {
              fs.mkdirSync(processFolder, { recursive: true });
            }

            // Move file to process folder
            const originalPath = req.file.path;
            const newPath = path.join(processFolder, req.file.filename);
            fs.renameSync(originalPath, newPath);

            // Return updated file path
            return res.json({ 
              success: true, 
              filePath: newPath,
              fileName: req.file.originalname
            });
          }
        }
        
        // Fallback to original behavior if no documentId
        res.json({ 
          success: true, 
          filePath: req.file.path,
          fileName: req.file.originalname
        });
      } catch (error) {
        console.error("Error in upload:", error);
        // Cleanup uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ 
          error: error instanceof Error ? error.message : "Erro interno do servidor" 
        });
      }
    });
  });

  // Endpoint to serve uploaded files
  app.get('/api/files/:filename', isAuthenticated, (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    // Send the file
    res.sendFile(filePath);
  });

  // Rota para verificar se o sistema tem um administrador
  app.get('/api/system/check', async (req, res) => {
    try {
      const hasAdmin = await hasAdminUser();
      res.json({ hasAdmin });
    } catch (error) {
      console.error('Erro ao verificar administrador:', error);
      res.status(500).json({ error: 'Erro ao verificar configuração do sistema' });
    }
  });

  // Rota para registrar o primeiro administrador (só funciona se não houver administradores existentes)
  app.post('/api/register/admin', async (req, res) => {
    try {
      // Verifica se já existe um administrador
      const hasAdmin = await hasAdminUser();
      if (hasAdmin) {
        return res.status(403).json({ error: 'Um administrador já existe no sistema' });
      }

      const adminData = insertUserSchema.parse(req.body);
      
      // Garante que o usuário será um administrador
      await createAdminUser(adminData);
      
      res.status(201).json({ success: true, message: 'Administrador criado com sucesso' });
    } catch (error) {
      console.error('Erro ao criar administrador:', error);
      handleValidationError(error, res);
    }
  });

  // Rota para registrar um novo usuário (requer autenticação de administrador)
  app.post('/api/register/user', isAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Verifica se o nome de usuário já existe
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ error: 'Nome de usuário já existe' });
      }
      
      // Cria a senha com hash
      const hashedPassword = await hashPassword(userData.password);
      
      // Cria o usuário
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      res.status(201).json({ success: true, userId: user.id });
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      handleValidationError(error, res);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
